import { Router } from "express";
import { generate } from "../controllers/generate.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/generate", requireAuth, generate);

export default router;
