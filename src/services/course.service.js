import { createHash } from "node:crypto";
import { generateCourse } from "../ai/generateCourse.js";
import { generateLesson } from "../ai/generateLesson.js";
import { classify, localCheck, moderate } from "../ai/guardrails.js";
import prisma from "../lib/prisma.js";
import { HttpError } from "../utils/HttpError.js";

const toCourse = (row) => ({
  id: row.id,
  title: row.title,
  summary: row.summary,
  level: row.level,
  duration: row.duration,
  steps: row.steps,
  progress: row.completed,
  createdAt: row.createdAt,
});

const notFound = () => new HttpError(404, "Course not found.", "NOT_FOUND");

const userKeyOf = (userId) => createHash("sha256").update(userId).digest("hex").slice(0, 32);

// usage log: recording must never break the request it describes
async function record(data) {
  try {
    await prisma.generation.create({ data });
  } catch (err) {
    console.error("Could not record generation:", err.message);
  }
}

// Order matters: the cheap checks run first so an off-topic prompt never
// reaches the expensive model.
export async function createPreview({ userId, text }) {
  const started = Date.now();
  const userKey = userKeyOf(userId);
  const usage = { prompt: 0, completion: 0 };
  const add = (u) => {
    usage.prompt += u?.prompt ?? 0;
    usage.completion += u?.completion ?? 0;
  };

  const save = (data) =>
    record({
      userId,
      prompt: text,
      promptTokens: usage.prompt,
      completionTokens: usage.completion,
      latencyMs: Date.now() - started,
      ...data,
    });

  const rejected = async (r) => {
    await save({ status: "REJECTED", reason: r.code });
    return r;
  };

  try {
    // 1. local check, 2. moderation, 3. scope check, 4. generation
    const local = localCheck(text);
    if (!local.ok) return await rejected(local);

    const mod = await moderate(text);
    if (!mod.ok) return await rejected(mod);

    const scope = await classify(text, userKey);
    add(scope.usage);
    if (!scope.ok) return await rejected(scope);

    const result = await generateCourse({ text, topic: scope.topic, userKey });
    add(result.usage);
    if (result.refused) {
      return await rejected({
        ok: false,
        code: "BLOCKED",
        message: "We can't build a course from that request.",
        suggestions: [],
      });
    }

    const { course } = result;
    const row = await prisma.course.create({
      data: {
        id: course.id,
        userId,
        prompt: text,
        title: course.title,
        summary: course.summary,
        level: course.level,
        duration: course.duration,
        steps: course.steps,
        stepCount: course.steps.length,
      },
    });

    await save({ status: "ACCEPTED", topic: scope.topic, courseId: row.id });
    return { ok: true, course: toCourse(row) };
  } catch (err) {
    await save({ status: "FAILED", reason: String(err.message).slice(0, 200) });
    throw err;
  }
}

// Everything below is scoped to the signed-in user: someone else's course
// looks exactly like one that doesn't exist.

export async function listCourses(userId) {
  const rows = await prisma.course.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      level: true,
      duration: true,
      stepCount: true,
      completed: true,
      createdAt: true,
    },
  });
  return rows.map(({ completed, ...rest }) => ({ ...rest, progress: completed }));
}

export async function getCourse(userId, id) {
  const row = await prisma.course.findFirst({ where: { id, userId } });
  if (!row) throw notFound();
  return toCourse(row);
}

export async function setProgress(userId, id, completed) {
  const row = await prisma.course.findFirst({ where: { id, userId }, select: { stepCount: true } });
  if (!row) throw notFound();
  if (!Number.isInteger(completed) || completed < 0 || completed > row.stepCount) {
    throw new HttpError(400, "Invalid progress.", "VALIDATION");
  }
  await prisma.course.update({ where: { id }, data: { completed } });
  return completed;
}

export async function deleteCourse(userId, id) {
  const { count } = await prisma.course.deleteMany({ where: { id, userId } });
  if (!count) throw notFound();
}

// The written lesson for one step. The first open generates it and stores it;
// every later open (any device) just reads it back.
const lessonsInFlight = new Map(); // two quick clicks share one generation

export async function getLesson(userId, courseId, stepId) {
  const course = await prisma.course.findFirst({ where: { id: courseId, userId } });
  if (!course) throw notFound();
  const index = course.steps.findIndex((s) => s.id === stepId);
  if (index < 0) throw notFound();

  const where = { courseId_stepId: { courseId, stepId } };
  const cached = await prisma.lesson.findUnique({ where });
  if (cached) return cached.content;

  const key = `${courseId}:${stepId}`;
  if (!lessonsInFlight.has(key)) {
    const job = (async () => {
      const started = Date.now();
      const base = {
        userId,
        kind: "LESSON",
        prompt: `Lesson: ${course.steps[index].title}`,
        topic: course.title,
        courseId,
      };
      try {
        const { lesson, usage } = await generateLesson({ course: toCourse(course), index, userKey: userKeyOf(userId) });
        // if another request stored one first, keep that one
        const row = await prisma.lesson.upsert({
          where,
          update: {},
          create: { courseId, stepId, content: lesson },
        });
        await record({ ...base, status: "ACCEPTED", promptTokens: usage.prompt, completionTokens: usage.completion, latencyMs: Date.now() - started });
        return row.content;
      } catch (err) {
        await record({ ...base, status: "FAILED", reason: String(err.message).slice(0, 200), latencyMs: Date.now() - started });
        throw err;
      }
    })().finally(() => lessonsInFlight.delete(key));
    lessonsInFlight.set(key, job);
  }
  return lessonsInFlight.get(key);
}
