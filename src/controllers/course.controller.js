import { z } from "zod";
import { generateCourseRequestSchema } from "../schemas/course.schema.js";
import { getCourseById, generateCourse, getCourses } from "../services/course.service.js"

export const createCourse = async (req, res) => {
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



export const listCourses = async (req, res) => {
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

        const result = await getCourseById(userId, courseId);

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