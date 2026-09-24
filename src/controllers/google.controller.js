import { randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";
import { googleClient } from "../lib/google.js";
import * as auth from "../services/auth.service.js";
import { setRefreshCookie } from "../utils/cookies.js";

const OAUTH_COOKIE = "g_oauth";
const oauthCookie = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: "lax", // Lax is sent on the top-level redirect back from Google
  path: "/api/auth/google",
};

const back = (res, error) => {
  res.clearCookie(OAUTH_COOKIE, oauthCookie);
  res.redirect(`${env.clientOrigin}/login${error ? `?error=${error}` : ""}`);
};

const sameString = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

// Step 1: send the browser to Google's consent screen.
// `state` blocks forged callbacks, PKCE ties the code to this browser.
export async function start(_req, res) {
  if (!env.google.configured) return back(res, "not_configured");

  const client = googleClient();
  const { codeVerifier, codeChallenge } = await client.generateCodeVerifierAsync();
  const state = randomBytes(24).toString("base64url");

  res.cookie(OAUTH_COOKIE, JSON.stringify({ state, codeVerifier }), {
    ...oauthCookie,
    maxAge: 10 * 60 * 1000,
  });
  res.redirect(
    client.generateAuthUrl({
      scope: ["openid", "email", "profile"],
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      prompt: "select_account",
    }),
  );
}

// Step 2: Google sends the person back here with a one-time code.
export async function callback(req, res) {
  const { code, state, error } = req.query;
  if (error) return back(res, error === "access_denied" ? "cancelled" : "failed");

  let saved;
  try {
    saved = JSON.parse(req.cookies[OAUTH_COOKIE]);
  } catch {
    return back(res, "failed");
  }
  if (typeof code !== "string" || !saved?.state || !sameString(state ?? "", saved.state)) {
    return back(res, "failed");
  }

  try {
    const client = googleClient();
    const { tokens } = await client.getToken({ code, codeVerifier: saved.codeVerifier });
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.google.clientId,
    });
    const profile = ticket.getPayload();
    if (!profile?.email || !profile.email_verified) return back(res, "unverified");

    const session = await auth.signInWithGoogle(
      { ...profile, name: profile.name ?? profile.email.split("@")[0] },
      { userAgent: req.get("user-agent"), ip: req.ip },
    );

    res.clearCookie(OAUTH_COOKIE, oauthCookie);
    setRefreshCookie(res, session.refreshToken);
    // no token in the URL: the app picks the session up from the cookie
    res.redirect(`${env.clientOrigin}/`);
  } catch (err) {
    console.error("Google sign-in failed:", err.message);
    back(res, "failed");
  }
}
