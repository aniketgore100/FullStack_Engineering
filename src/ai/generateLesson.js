import { env } from "../config/env.js";
import { callJson } from "./openaiJson.js";
import { LESSON_SCHEMA, LESSON_SYSTEM } from "./prompts.js";

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// same rule as courses: check the shape and clamp lengths before trusting it
export function normalizeLesson(raw) {
  const sections = (Array.isArray(raw?.sections) ? raw.sections : [])
    .map((s) => ({ heading: str(s?.heading, 120), body: str(s?.body, 3500) }))
    .filter((s) => s.heading && s.body);
  if (sections.length < 3 || sections.length > 8) throw new Error("Unexpected number of sections.");

  return {
    sections,
    takeaways: (Array.isArray(raw.takeaways) ? raw.takeaways : [])
      .map((t) => str(t, 240))
      .filter(Boolean)
      .slice(0, 6),
    exercise: str(raw.exercise, 800),
  };
}

// what the model is told about where this step sits in the course
const contextFor = (course, index) => {
  const steps = course.steps;
  const titles = (list) => (list.length ? list.map((s) => s.title).join("; ") : "none");
  const step = steps[index];
  return `<course_context>
Course: ${course.title}
Level: ${course.level}
About: ${course.summary}
This is step ${index + 1} of ${steps.length}: ${step.title} (${step.duration})
Step overview: ${step.overview}
Topics to teach: ${step.topics.join("; ")}
Earlier steps (already taught): ${titles(steps.slice(0, index))}
Later steps (do not teach yet): ${titles(steps.slice(index + 1))}
</course_context>`;
};

// one retry, like course generation
export async function generateLesson({ course, index, userKey }) {
  const usage = { prompt: 0, completion: 0 };
  let lastError;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await callJson({
        model: env.openai.courseModel,
        system: LESSON_SYSTEM,
        user: contextFor(course, index),
        name: "step_lesson",
        schema: LESSON_SCHEMA,
        maxTokens: 3500,
        userKey,
      });
      usage.prompt += res.usage.prompt;
      usage.completion += res.usage.completion;
      if (res.refused) throw new Error("Model declined to write the lesson.");
      return { lesson: normalizeLesson(res.data), usage };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
