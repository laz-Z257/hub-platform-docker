import { Router } from "express";
import rateLimit from "express-rate-limit";
import { sendMessage, getHistory } from "./chat.controller";
import { authMiddleware } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { sendMessageSchema, historyQuerySchema } from "./chat.schema";

const router = Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Demasiadas solicitudes. Intenta de nuevo en 1 minuto." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authMiddleware);
router.use(chatLimiter);

router.post("/message", validate(sendMessageSchema), sendMessage);
router.get("/history", validate(historyQuerySchema), getHistory);

export default router;
