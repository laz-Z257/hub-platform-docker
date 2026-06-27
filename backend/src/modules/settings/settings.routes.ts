import { Router } from "express";
import { getSettings, updateSettings } from "./settings.controller";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/admin";

const router = Router();

router.get("/", authMiddleware, getSettings);
router.put("/", authMiddleware, adminOnly, updateSettings);

export default router;
