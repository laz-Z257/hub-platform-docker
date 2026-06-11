import { Router } from "express";
import { createUser, listUsers, updateUser, toggleUserStatus } from "./users.controller";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/admin";
import { validate } from "../../middlewares/validate";
import { createUserSchema, updateUserSchema, uuidParamsSchema, listUsersQuerySchema } from "./users.schema";

const router = Router();

router.post("/", authMiddleware, adminOnly, validate(createUserSchema), createUser);
router.get("/", authMiddleware, adminOnly, validate(listUsersQuerySchema), listUsers);
router.patch("/:id", authMiddleware, adminOnly, validate({ body: updateUserSchema.body, params: uuidParamsSchema }), updateUser);
router.patch("/:id/toggle-status", authMiddleware, adminOnly, validate({ params: uuidParamsSchema }), toggleUserStatus);

export default router;
