import { courseOutlineSchema } from "../schemas/course.schema.js";
import { course, generateCourse, getCourses } from "../services/generate.service.js"

export const generate = async (req, res) => {
    try {

        const input = req.body;
        const result = await generateCourse(req.userId, input.prompt);

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