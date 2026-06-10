import { Router } from "express";
import { listUsers, updateUser, toggleUserStatus } from "./users.controller";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/admin";
import { validate } from "../../middlewares/validate";
import { updateUserSchema, uuidParamsSchema } from "./users.schema";

const router = Router();

router.get("/", authMiddleware, adminOnly, listUsers);
router.patch("/:id", authMiddleware, adminOnly, validate({ body: updateUserSchema.body, params: uuidParamsSchema }), updateUser);
router.patch("/:id/toggle-status", authMiddleware, adminOnly, validate({ params: uuidParamsSchema }), toggleUserStatus);

export default router;
