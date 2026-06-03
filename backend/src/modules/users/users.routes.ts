import { Router } from "express";
import { listUsers } from "./users.controller";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/admin";

const router = Router();

router.get("/", authMiddleware, adminOnly, listUsers);

export default router;
