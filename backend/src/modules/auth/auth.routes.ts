import { Router } from "express";
import { login, me } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { loginSchema } from "./auth.schema";
import { authMiddleware } from "../../middlewares/auth";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", authMiddleware, me);

export default router;
