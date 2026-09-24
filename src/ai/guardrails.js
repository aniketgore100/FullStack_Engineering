import { env } from "../config/env.js";
import { openai } from "../lib/openai.js";
import { CLASSIFIER_SCHEMA, CLASSIFIER_SYSTEM, wrapLearnerMessage } from "./prompts.js";
import { callJson } from "./openaiJson.js";

const SUGGESTIONS = [
  "Learn Python from scratch",
  "Understand how the stock market works",
  "Get started with UI design",
];

const reject = (code, message) => ({ ok: false, code, message, suggestions: SUGGESTIONS });

// Layer 1: free and instant, no API call. Bare numbers / symbols ("2+2",
// "12345", "???") can't be a topic.
export function localCheck(text) {
  if (!/\p{L}{2,}/u.test(text)) {
    return reject(
      "UNCLEAR",
      "Courseify builds learning courses. Tell us what you want to learn, for example \"Learn basic arithmetic\".",
    );
  }
  return { ok: true };
}

// Layer 2: OpenAI's moderation endpoint (free). Blocks harmful content.
export async function moderate(text) {
  const res = await openai().moderations.create({
    model: "omni-moderation-latest",
    input: text,
  });
  if (res.results?.[0]?.flagged) {
    return reject("BLOCKED", "We can't build a course from that request. Try a different topic.");
  }
  return { ok: true };
}

// Layer 3: is this actually a request to learn something? A small model
// answers with a strict verdict, and only "course_request" moves on.
export async function classify(text, userKey) {
  const { data, refused, usage } = await callJson({
    model: env.openai.classifierModel,
    system: CLASSIFIER_SYSTEM,
    user: wrapLearnerMessage(text),
    name: "scope_check",
    schema: CLASSIFIER_SCHEMA,
    maxTokens: 200,
    userKey,
  });

  if (refused) return { ...reject("BLOCKED", "We can't build a course from that request."), usage };

  if (data.verdict === "course_request" && data.topic.trim()) {
    return { ok: true, topic: data.topic.trim().slice(0, 120), usage };
  }

  const fallback =
    "Courseify only builds learning courses. Tell us what you want to learn, for example \"Learn Python from scratch\".";
  return {
    ...reject(
      data.verdict === "unclear" ? "UNCLEAR" : "OFF_TOPIC",
      data.reason?.trim().slice(0, 240) || fallback,
    ),
    usage,
  };
}
