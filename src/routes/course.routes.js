import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as ctrl from "../controllers/course.controller.js";

// every generation costs real money, so cap it per user (not per IP)
const perUser = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 15,
  keyGenerator: (req) => req.user.id,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "You're generating a lot of courses. Try again in a few minutes.", code: "RATE_LIMITED" },
});

// lessons are cheaper than courses and cached, so the cap is higher
const lessonLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 40,
  keyGenerator: (req) => req.user.id,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "You're opening a lot of lessons. Try again in a few minutes.", code: "RATE_LIMITED" },
});

const router = Router();
router.get("/", ctrl.list);
router.post("/preview", perUser, ctrl.preview);
router.get("/:id", ctrl.get);
router.patch("/:id/progress", ctrl.setProgress);
router.post("/:id/steps/:stepId/lesson", lessonLimit, ctrl.lesson);
router.delete("/:id", ctrl.remove);

export default router;
