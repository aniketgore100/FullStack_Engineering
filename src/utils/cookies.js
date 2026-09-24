import { env } from "../config/env.js";

export const REFRESH_COOKIE = "rt";

const base = {
  httpOnly: true, // not readable from JS, so XSS can't steal it
  secure: env.isProd,
  sameSite: "lax",
  path: "/api/auth", // only sent to the auth endpoints
};

export const setRefreshCookie = (res, raw) =>
  res.cookie(REFRESH_COOKIE, raw, {
    ...base,
    maxAge: env.refreshTtlDays * 24 * 60 * 60 * 1000,
  });

export const clearRefreshCookie = (res) => res.clearCookie(REFRESH_COOKIE, base);
