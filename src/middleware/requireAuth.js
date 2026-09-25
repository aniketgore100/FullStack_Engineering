import { verifyAccessToken } from "../lib/session.js";

// Stateless: trusts a valid, unexpired access token; no DB lookup.
export async function requireAuth(req, res, next) {
  const [scheme, token] = (req.get("authorization") || "").split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    req.userId = await verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token", code: "token_expired" });
  }
}
