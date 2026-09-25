import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import {
  ACCESS_TTL_SECONDS,
  REFRESH_REUSE_GRACE_MS,
  REFRESH_TTL_SECONDS,
} from "../lib/config.js";
import { signAccessToken } from "../lib/session.js";



const hash = (token) => crypto.createHash("sha256").update(token).digest("hex");



async function issue(userId, familyId, meta, db = prisma) {
  const refreshToken = crypto.randomBytes(48).toString("base64url");
  await db.refreshToken.create({
    data: {
      userId,
      familyId,
      tokenHash: hash(refreshToken),
      userAgent: meta.userAgent?.slice(0, 255),
      ip: meta.ip,
      expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
    },
  });
  return {
    accessToken: await signAccessToken(userId),
    refreshToken,
    expiresIn: ACCESS_TTL_SECONDS,
  };
}



export async function startSession(userId, meta = {}) {
  await prisma.refreshToken.deleteMany({
    where: { userId, expiresAt: { lt: new Date() } },
  });
  return issue(userId, crypto.randomUUID(), meta);
}



export async function rotate(refreshToken, meta = {}) {
  const row = await prisma.refreshToken.findUnique({
    where: { tokenHash: hash(refreshToken) },
  });
  if (!row) {
    return null;
  }

  if (row.revokedAt) {
    if (Date.now() - row.revokedAt.getTime() > REFRESH_REUSE_GRACE_MS) {
      await prisma.refreshToken.updateMany({
        where: { familyId: row.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return null;
  }
  if (row.expiresAt < new Date()) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.refreshToken.updateMany({
      where: { id: row.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (count === 0) {
      return null;
    }
    return issue(row.userId, row.familyId, meta, tx);
  });
}




export async function revoke(refreshToken) {
  const row = await prisma.refreshToken.findUnique({
    where: { tokenHash: hash(refreshToken) },
  });
  if (!row) {
    return;
  }
  await prisma.refreshToken.updateMany({
    where: { familyId: row.familyId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
