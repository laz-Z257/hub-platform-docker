import { Router } from "express";
import { getKpis } from "./dashboard.controller";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/admin";

const router = Router();

router.get("/kpis", authMiddleware, adminOnly, getKpis);

export default router;
