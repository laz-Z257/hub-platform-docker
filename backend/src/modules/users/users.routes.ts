import { Router } from "express";
import { listUsers, updateUser, toggleUserStatus } from "./users.controller";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/admin";
import { validate } from "../../middlewares/validate";
import { updateUserSchema } from "./users.schema";

const router = Router();

router.get("/", authMiddleware, adminOnly, listUsers);
router.patch("/:id", authMiddleware, adminOnly, validate(updateUserSchema), updateUser);
router.patch("/:id/toggle-status", authMiddleware, adminOnly, toggleUserStatus);

export default router;
