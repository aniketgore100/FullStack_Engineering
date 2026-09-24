import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as ctrl from "../controllers/auth.controller.js";
import * as google from "../controllers/google.controller.js";

const limit = (max) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many attempts. Try again in a few minutes.", code: "RATE_LIMITED" },
  });

const router = Router();

// sign in: the only way to get an account is Google
router.get("/google", limit(30), google.start);
router.get("/google/callback", limit(30), google.callback);

router.post("/refresh", limit(100), ctrl.refresh);
router.post("/logout", ctrl.logout);

export default router;
