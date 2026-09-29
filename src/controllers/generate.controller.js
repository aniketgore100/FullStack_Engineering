import { z } from "zod";
import { generateCourseRequestSchema } from "../schemas/course.schema.js";
import { course, generateCourse, getCourses } from "../services/generate.service.js"

export const generate = async (req, res) => {
    try {

        const parsed = generateCourseRequestSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid request",
                errors: z.flattenError(parsed.error).fieldErrors,
            });
        }

        const result = await generateCourse(req.userId, parsed.data.prompt);

        return res.status(201).json({
            message: "Course generated successfully",
            course: result
        });

    } catch (error) {
        console.error(error);
        return res.status(401).json({
            message: "Something Went Wrong"
        })
    }
}



export const courses = async (req, res) => {
    try {
        const userId = req.userId;
        const result = await getCourses(userId);

        return res.status(201).json({
            message: "Course generated successfully",
            course: result
        });
    } catch (error) {
        res.status(501).json({
            message: "Something Went Wrong"
        })
    }
}


export const getCourseDetails = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.userId;

        if (!courseId) {
            return res.status(401).json({
                message: "please provide courseId"
            })
        }

        const result = await course(userId, courseId);

        return res.status(201).json({
            message: "Data Fetched Successfully",
            data: result
        })
    } catch (error) {
        res.status(501).json({
            message: "Something went wrong"
        })
    }
}