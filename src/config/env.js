import "dotenv/config";

const required = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is missing. Add it to the backend .env file.`);
  return value;
};

const accessSecret = required("JWT_ACCESS_SECRET");
if (accessSecret.length < 32) {
  throw new Error("JWT_ACCESS_SECRET must be at least 32 characters.");
}

const googleClientId = process.env.GOOGLE_CLIENT_ID ?? "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
const openaiKey = process.env.OPENAI_API_KEY ?? "";
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

export const env = {
  port: Number(process.env.PORT) || 8000,
  isProd: process.env.NODE_ENV === "production",
  clientOrigin,
  accessSecret,
  accessTtl: process.env.ACCESS_TOKEN_TTL ?? "15m",
  refreshTtlDays: Number(process.env.REFRESH_TOKEN_DAYS) || 7,
  openai: {
    apiKey: openaiKey,
    configured: Boolean(openaiKey),
    // small + cheap model for the yes/no scope check, stronger one for writing the course
    classifierModel: process.env.OPENAI_CLASSIFIER_MODEL ?? "gpt-4.1-mini",
    courseModel: process.env.OPENAI_COURSE_MODEL ?? "gpt-4.1",
  },
  google: {
    clientId: googleClientId,
    clientSecret: googleClientSecret,
    configured: Boolean(googleClientId && googleClientSecret),
    // must match an "Authorized redirect URI" in the Google Cloud console
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ?? `${clientOrigin}/api/auth/google/callback`,
  },
};

if (!env.google.configured) {
  console.warn(
    "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set. Google sign-in is disabled until you add them to .env.",
  );
}

if (!env.openai.configured) {
  console.warn("OPENAI_API_KEY is not set. Course generation is disabled until you add it to .env.");
}
