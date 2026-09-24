import * as auth from "../services/auth.service.js";
import { REFRESH_COOKIE, clearRefreshCookie, setRefreshCookie } from "../utils/cookies.js";

const meta = (req) => ({ userAgent: req.get("user-agent"), ip: req.ip });

export const refresh = async (req, res) => {
  try {
    const session = await auth.refresh(req.cookies[REFRESH_COOKIE], meta(req));
    // the refresh token only ever travels in the httpOnly cookie, never in JSON
    if (session.refreshToken) setRefreshCookie(res, session.refreshToken);
    res.json({ user: session.user, accessToken: session.accessToken });
  } catch (err) {
    clearRefreshCookie(res);
    throw err;
  }
};

export const logout = async (req, res) => {
  await auth.logout(req.cookies[REFRESH_COOKIE]);
  clearRefreshCookie(res);
  res.status(204).end();
};
