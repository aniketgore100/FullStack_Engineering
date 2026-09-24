import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { callJson } from "./openaiJson.js";
import { COURSE_SCHEMA, COURSE_SYSTEM, wrapLearnerMessage } from "./prompts.js";

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");


export function normalizeCourse(raw) {
  const steps = Array.isArray(raw?.steps) ? raw.steps : [];
  if (steps.length < 4 || steps.length > 8) throw new Error("Unexpected number of steps.");

  const course = {
    id: randomUUID(),
    title: str(raw.title, 80),
    summary: str(raw.summary, 200),
    level: ["Beginner", "Intermediate", "Advanced"].includes(raw.level) ? raw.level : "Beginner",
    duration: str(raw.duration, 40),
    steps: steps.map((s, i) => ({
      id: `s${i + 1}`,
      title: str(s?.title, 80),
      duration: str(s?.duration, 20),
      summary: str(s?.summary, 120),
      overview: str(s?.overview, 500),
      topics: (Array.isArray(s?.topics) ? s.topics : [])
        .map((t) => str(t, 80))
        .filter(Boolean)
        .slice(0, 5),
    })),
  };

  if (!course.title || course.steps.some((s) => !s.title || !s.overview || !s.topics.length)) {
    throw new Error("Course is missing required fields.");
  }
  return course;
}

export async function generateCourse({ text, topic, userKey }) {
  const usage = { prompt: 0, completion: 0 };
  let lastError;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await callJson({
        model: env.openai.courseModel,
        system: COURSE_SYSTEM,
        user: wrapLearnerMessage(text, `Subject: ${topic}\n\n`),
        name: "course_roadmap",
        schema: COURSE_SCHEMA,
        maxTokens: 3000,
        userKey,
      });
      usage.prompt += res.usage.prompt;
      usage.completion += res.usage.completion;
      if (res.refused) return { refused: true, usage };
      return { course: normalizeCourse(res.data), usage };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
