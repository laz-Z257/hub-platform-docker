import { Router } from "express";
import { redirectToModule } from "./external-systems.controller";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/admin";

const router = Router();

router.get("/:module", authMiddleware, adminOnly, redirectToModule);

export default router;
