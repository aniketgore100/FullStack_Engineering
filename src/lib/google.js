import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";

export const googleClient = () =>
  new OAuth2Client({
    clientId: env.google.clientId,
    clientSecret: env.google.clientSecret,
    redirectUri: env.google.redirectUri,
  });
