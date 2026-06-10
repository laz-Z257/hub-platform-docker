import { Router } from "express";
import { sendMessage, getHistory } from "./chat.controller";
import { authMiddleware } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { sendMessageSchema, historyQuerySchema } from "./chat.schema";

const router = Router();

router.use(authMiddleware);

router.post("/message", validate(sendMessageSchema), sendMessage);
router.get("/history", validate(historyQuerySchema), getHistory);

export default router;
