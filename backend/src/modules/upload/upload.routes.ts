import { Router } from "express";
import multer from "multer";
import { uploadFile } from "./upload.controller";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/admin";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/", authMiddleware, adminOnly, upload.single("file"), uploadFile);

export default router;
