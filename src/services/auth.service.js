import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import prisma from "../lib/prisma.js";
import { HttpError } from "../utils/HttpError.js";
import { generateRefreshToken, hashToken, signAccessToken } from "../utils/tokens.js";

const REFRESH_TTL_MS = env.refreshTtlDays * 24 * 60 * 60 * 1000;

// Two tabs can refresh at the same moment with the same cookie. The loser
// arrives just after the winner rotated the token; inside this window we
// treat that as a harmless race instead of token theft.
const RACE_WINDOW_MS = 10_000;

const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  avatarUrl: u.avatarUrl,
  createdAt: u.createdAt,
});

const newRefreshRow = (userId, familyId, meta) => {
  const { raw, hash } = generateRefreshToken();
  return {
    raw,
    data: {
      tokenHash: hash,
      familyId,
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      userAgent: meta.userAgent?.slice(0, 255),
      ip: meta.ip,
    },
  };
};

async function startSession(user, meta) {
  const { raw, data } = newRefreshRow(user.id, randomUUID(), meta);
  await prisma.refreshToken.create({ data });
  return {
    user: publicUser(user),
    accessToken: signAccessToken(user.id),
    refreshToken: raw,
  };
}

// Called after Google has verified who the person is. Creates the account on
// the first sign-in, and refreshes name / photo on later ones.
export async function signInWithGoogle(profile, meta) {
  const fields = {
    email: profile.email.toLowerCase(),
    name: profile.name,
    avatarUrl: profile.picture ?? null,
  };
  const user = await prisma.user.upsert({
    where: { googleId: profile.sub },
    update: fields,
    create: { googleId: profile.sub, ...fields },
  });

  // housekeeping: drop this user's expired tokens
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id, expiresAt: { lt: new Date() } },
  });
  return startSession(user, meta);
}

// Trade a refresh token for a new access token, and rotate the refresh token.
export async function refresh(rawToken, meta) {
  const invalid = () =>
    new HttpError(401, "Your session expired. Please log in again.", "REFRESH_INVALID");
  if (!rawToken) throw invalid();

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: true },
  });
  if (!stored) throw invalid();

  if (stored.revokedAt) {
    const justRotated =
      stored.replacedById && Date.now() - stored.revokedAt.getTime() < RACE_WINDOW_MS;
    if (justRotated) {
      // lost a race with another tab: it already holds the new cookie
      return { user: publicUser(stored.user), accessToken: signAccessToken(stored.userId) };
    }
    // an old token came back: assume it leaked, end the whole login chain
    await prisma.refreshToken.updateMany({
      where: { familyId: stored.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw invalid();
  }

  if (stored.expiresAt < new Date()) throw invalid();

  const next = newRefreshRow(stored.userId, stored.familyId, meta);
  const rotated = await prisma.$transaction(async (tx) => {
    // claim the old token; only one concurrent request can win this
    const claimed = await tx.refreshToken.updateMany({
      where: { id: stored.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (claimed.count === 0) return null;

    const created = await tx.refreshToken.create({ data: next.data });
    await tx.refreshToken.update({
      where: { id: stored.id },
      data: { replacedById: created.id },
    });
    return created;
  });

  return {
    user: publicUser(stored.user),
    accessToken: signAccessToken(stored.userId),
    refreshToken: rotated ? next.raw : undefined, // undefined = keep current cookie
  };
}

export async function logout(rawToken) {
  if (!rawToken) return;
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });
  if (!stored) return;
  await prisma.refreshToken.updateMany({
    where: { familyId: stored.familyId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
