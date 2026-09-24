import { env } from "../config/env.js";
import * as courses from "../services/course.service.js";
import { HttpError } from "../utils/HttpError.js";


const clean = (v) =>
  String(v ?? "")
    .replace(/<\/?\s*learner_message\s*>/gi, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function preview(req, res) {
  if (!env.openai.configured) {
    throw new HttpError(503, "The course generator isn't set up yet.", "AI_NOT_CONFIGURED");
  }

  const text = clean(req.body?.prompt);
  if (text.length < 3 || text.length > 500) {
    throw new HttpError(400, "Describe what you want to learn in 3 to 500 characters.", "VALIDATION", {
      prompt: "Use between 3 and 500 characters.",
    });
  }

  let result;
  try {
    result = await courses.createPreview({ userId: req.user.id, text });
  } catch (err) {
    console.error("Course generation failed:", err.message);
    throw new HttpError(502, "We couldn't build your course right now. Please try again.", "AI_UNAVAILABLE");
  }

  if (!result.ok) {
    // the request worked, the prompt just isn't something we build a course for
    return res
      .status(422)
      .json({ code: result.code, message: result.message, suggestions: result.suggestions });
  }
  res.json({ course: result.course });
}

export const list = async (req, res) =>
  res.json({ courses: await courses.listCourses(req.user.id) });

export const get = async (req, res) =>
  res.json({ course: await courses.getCourse(req.user.id, req.params.id) });

export const setProgress = async (req, res) =>
  res.json({
    progress: await courses.setProgress(req.user.id, req.params.id, req.body?.completed),
  });

export const remove = async (req, res) => {
  await courses.deleteCourse(req.user.id, req.params.id);
  res.status(204).end();
};

export async function lesson(req, res) {
  if (!env.openai.configured) {
    throw new HttpError(503, "The course generator isn't set up yet.", "AI_NOT_CONFIGURED");
  }
  try {
    const content = await courses.getLesson(req.user.id, req.params.id, req.params.stepId);
    res.json({ lesson: content });
  } catch (err) {
    if (err instanceof HttpError) throw err; // e.g. 404 for someone else's course
    console.error("Lesson generation failed:", err.message);
    throw new HttpError(502, "We couldn't write this lesson right now. Please try again.", "AI_UNAVAILABLE");
  }
}
