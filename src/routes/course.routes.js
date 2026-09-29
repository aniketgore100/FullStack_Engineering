import { Router } from "express";
import { createCourse, listCourses, getCourseDetails } from "../controllers/course.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { createCourseLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/", requireAuth, createCourseLimiter, createCourse);
router.get("/", requireAuth, listCourses);
router.get("/:id", requireAuth, getCourseDetails);

export default router;
