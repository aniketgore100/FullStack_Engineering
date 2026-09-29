import { Router } from "express";
import { courses, generate, getCourseDetails } from "../controllers/generate.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { generateLimiter } from "../middleware/rateLimit.js";
import { course, getCourses } from "../services/generate.service.js";

const router = Router();

router.post("/generate", requireAuth, generateLimiter, generate);
router.get("/getCourse", requireAuth, courses);
router.get("/course/:id", requireAuth, getCourseDetails);

export default router;
