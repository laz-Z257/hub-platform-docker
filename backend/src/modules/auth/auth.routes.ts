import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, me } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { loginSchema } from "./auth.schema";
import { authMiddleware } from "../../middlewares/auth";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Demasiados intentos. Intenta de nuevo en 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, validate(loginSchema), login);
router.get("/me", authMiddleware, me);

export default router;
