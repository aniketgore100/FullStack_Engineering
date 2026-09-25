import { config } from "../lib/config.js";
import { buildAuthUrl, getProfileFromCode } from "../services/google.service.js";
import { findUserById, publicUser, upsertGoogleUser } from "../services/user.service.js";
import { revoke, rotate, startSession } from "../services/token.service.js";


const toClient = (res, params) =>
  res.redirect(`${config.clientOrigin}/auth/callback#${new URLSearchParams(params)}`);

const clientMeta = (req) => ({ userAgent: req.get("user-agent"), ip: req.ip });

const STATE_RE = /^[A-Za-z0-9_-]{16,128}$/;



export function googleRedirect(req, res) {

  const { state } = req.query;
  if (typeof state !== "string" || !STATE_RE.test(state)) {
    return res.status(400).json({ error: "Missing or invalid state" });
  }
  res.redirect(buildAuthUrl(state));

}



export async function googleCallback(req, res) {

  const { code, state, error } = req.query;

  if (!state || typeof state !== "string") {
    return toClient(res, { error: "invalid_state" });
  }

  if (error) {
    return toClient(res, { error: "cancelled", state });
  }

  if (!code) {
    return toClient(res, { error: "failed", state });
  }

  try {
    const profile = await getProfileFromCode(String(code));
    if (!profile.email || !profile.emailVerified) {
      return toClient(res, { error: "unverified_email", state });
    }

    const user = await upsertGoogleUser(profile);
    const tokens = await startSession(user.id, clientMeta(req));
    toClient(res, {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      state,
    });
  } catch (err) {
    console.error("[auth] google callback failed:", err);
    toClient(res, { error: "failed", state });
  }
}



export async function me(req, res) {

  const user = await findUserById(req.userId);
  if (!user) {
    return res.status(401).json({ error: "User no longer exists" });
  }
  res.json({ user: publicUser(user) });

}

export async function refresh(req, res) {

  const { refreshToken } = req.body ?? {};
  if (typeof refreshToken !== "string" || !refreshToken) {
    return res.status(400).json({ error: "refreshToken is required" });
  }
  const tokens = await rotate(refreshToken, clientMeta(req));
  if (!tokens) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
  res.json(tokens);

}


export async function logout(req, res) {
  const { refreshToken } = req.body ?? {};
  if (typeof refreshToken === "string" && refreshToken) {
    await revoke(refreshToken);
  }
  res.json({ ok: true });
}
