import { Router } from "express";
import rateLimit from "express-rate-limit";
import { registerToken } from "./push.controller";
import { validate } from "../../middlewares/validate";
import { registerPushSchema } from "./push.schema";
import { authMiddleware } from "../../middlewares/auth";

const router = Router();

const pushLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Demasiadas solicitudes. Intenta de nuevo en 1 minuto." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authMiddleware);

router.post("/register", pushLimiter, validate({ body: registerPushSchema }), registerToken);

export default router;
