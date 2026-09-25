import "dotenv/config";

const required = ["JWT_ACCESS_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn(`[config] Missing env vars: ${missing.join(", ")}`);
}

const port = Number(process.env.PORT) || 8000;

export const config = {
  port,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  jwtSecret: process.env.JWT_ACCESS_SECRET,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ||
      `http://localhost:${port}/api/auth/google/callback`,
  },
};

export const ACCESS_TTL_SECONDS = 60 * 15;
export const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30;
// A just-rotated token presented again within this window (e.g. two tabs racing)
// is rejected but does not burn the whole token family.
export const REFRESH_REUSE_GRACE_MS = 10 * 1000;
