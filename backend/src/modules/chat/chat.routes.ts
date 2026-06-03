import { Router } from "express";
import { sendMessage, getHistory } from "./chat.controller";
import { authMiddleware } from "../../middlewares/auth";

const router = Router();

router.use(authMiddleware);

router.post("/message", sendMessage);
router.get("/history", getHistory);

export default router;
