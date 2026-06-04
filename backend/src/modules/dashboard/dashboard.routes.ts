import { Router } from "express";
import { getKpis } from "./dashboard.controller";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/admin";
import { validate } from "../../middlewares/validate";
import { kpisQuerySchema } from "./dashboard.schema";

const router = Router();

router.get("/kpis", validate(kpisQuerySchema), authMiddleware, adminOnly, getKpis);

export default router;
