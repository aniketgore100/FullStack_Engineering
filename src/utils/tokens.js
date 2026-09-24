import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const ISSUER = "courseify";

// short-lived, stateless: proves who the caller is for a few minutes
export const signAccessToken = (userId) =>
  jwt.sign({}, env.accessSecret, {
    subject: userId,
    issuer: ISSUER,
    expiresIn: env.accessTtl,
    algorithm: "HS256",
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.accessSecret, { issuer: ISSUER, algorithms: ["HS256"] });

// long-lived, opaque and random: only its hash is ever stored
export const generateRefreshToken = () => {
  const raw = crypto.randomBytes(48).toString("base64url");
  return { raw, hash: hashToken(raw) };
};

export const hashToken = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");
