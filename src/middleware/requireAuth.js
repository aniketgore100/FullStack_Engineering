import { HttpError } from "../utils/HttpError.js";
import { verifyAccessToken } from "../utils/tokens.js";

// Guards a route: needs "Authorization: Bearer <access token>".
export function requireAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "Please log in to continue.", "NO_TOKEN");
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    // the client uses TOKEN_EXPIRED to know it should try a refresh
    const expired = err.name === "TokenExpiredError";
    throw new HttpError(
      401,
      expired ? "Your session expired." : "Invalid token.",
      expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
    );
  }
}
