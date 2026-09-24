import OpenAI from "openai";
import { env } from "../config/env.js";

let client;
export const openai = () =>
  (client ??= new OpenAI({ apiKey: env.openai.apiKey, timeout: 60_000, maxRetries: 1 }));
