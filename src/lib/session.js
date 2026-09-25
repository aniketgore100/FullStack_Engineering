import { SignJWT, jwtVerify } from "jose";
import { ACCESS_TTL_SECONDS, config } from "./config.js";

const key = () => new TextEncoder().encode(config.jwtSecret);

// Short-lived, stateless access token: just the user id.
export const signAccessToken = (userId) =>
  new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SECONDS}s`)
    .sign(key());

export async function verifyAccessToken(token) {
  const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
  return payload.sub;
}
