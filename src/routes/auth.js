import { Router } from "express";
import * as auth from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/google", auth.googleRedirect);
router.get("/google/callback", auth.googleCallback);
router.get("/me", requireAuth, auth.me);
router.post("/refresh", auth.refresh);
router.post("/logout", auth.logout);

export default router;
