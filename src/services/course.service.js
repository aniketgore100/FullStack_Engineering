import OpenAI from "openai";
import { COURSE_OUTLINE_PROMPT } from "./prompts/courseOutline.js";
import { courseOutlineSchema } from "../schemas/course.schema.js";
import { prisma } from "../lib/prisma.js";
const client = new OpenAI();

const setStatus = (id, status) =>
    prisma.courseGeneration.update({ where: { id }, data: { status } });

export const generateCourse = async (userId, prompt) => {

    const generation = await prisma.courseGeneration.create({
        data: { userId, prompt, status: "PROCESSING" },
    });

    try {
        const response = await client.responses.create({
            model: "gpt-4o-mini",
            input: ` ${COURSE_OUTLINE_PROMPT}
                 USER REQUEST:
                  ${prompt}
                `,
        });
        const data = JSON.parse(response.output_text);
        const validated_result = courseOutlineSchema.parse(data);

        await prisma.$transaction([
            prisma.course.create({
                data: {
                    generationId: generation.id,
                    title: validated_result.title,
                    description: validated_result.description,
                    modules: {
                        create: validated_result.modules.map((m) => ({
                            title: m.title,
                            description: m.description,
                            order: m.order
                        })),
                    },
                },
            }),
            prisma.courseGeneration.update({
                where: { id: generation.id },
                data: { status: "COMPLETED" },
            }),
        ]);

        return validated_result;
    } catch (error) {
        await setStatus(generation.id, "FAILED");
        throw error;
    }
}


export const getCourses = async (userId) => {
    try {
        const result = prisma.courseGeneration.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                prompt: true,
                status: true,
                createdAt: true,
                updatedAt: true,

                course: {
                    select: {
                        id: true
                    }
                }

            }
        })
        return result;
    } catch (error) {
        throw error;
    }
}

export const getCourseById = async (userId, courseId) => {
    try {
        const courseDetails = await prisma.course.findUnique({
            where: {
                id: courseId,
                generation : {
                    userId : userId
                },
            },
            select: {
                id : true,
                title: true,
                description : true,
                createdAt : true,
                updatedAt : true,

                modules : {
                    select : {
                        id : true,
                        title : true,
                        description : true,
                        order : true,
                        createdAt : true,
                        updatedAt : true
                    }
                }
            }
        });
        return courseDetails;
    } catch (error) {
        throw error;
    }
}