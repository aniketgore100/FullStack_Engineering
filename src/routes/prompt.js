import { Router } from "express";
import { generate, getCourse } from "../controllers/generate.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/generate", requireAuth, generate);
router.get("/getCourse", requireAuth, getCourse);

export default router;
