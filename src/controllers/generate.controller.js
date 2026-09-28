import { courseOutlineSchema } from "../schemas/course.schema.js";
import { generateCourse, getCourses } from "../services/generate.service.js"

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



export const getCourse = async (req, res) => {
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