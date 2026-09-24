import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import authRoutes from "./auth.routes.js";
import courseRoutes from "./course.routes.js";

const router = Router();

// public: sign up, log in, refresh, log out
router.use("/auth", authRoutes);

// Everything below this line needs a logged-in user. Add new API routes
// underneath it and they are protected automatically.
router.use(requireAuth);

router.use("/courses", courseRoutes);

export default router;
