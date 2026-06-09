import { Router } from "express";
import { getKpis } from "./dashboard.controller";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/admin";
import { validate } from "../../middlewares/validate";
import { kpisQuerySchema } from "./dashboard.schema";

const router = Router();

router.get("/kpis", authMiddleware, adminOnly, validate(kpisQuerySchema), getKpis);

export default router;
