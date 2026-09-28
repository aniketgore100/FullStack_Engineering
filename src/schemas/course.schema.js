import { z } from "zod";

export const generateCourseRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(3)
    .max(1000),
});

export const courseOutlineSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),

  modules: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      order: z.number().int().positive(),
    })
  ).min(1),
});