import { Router } from "express";
import { z } from "zod";
import { getSettings, updateSettings } from "./settings.controller";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/admin";
import { validate } from "../../middlewares/validate";

const updateSchema = {
  body: z.object({
    nombre: z.string().trim().max(200, "El nombre no puede superar 200 caracteres").optional(),
    contribuyente: z.string().trim().max(50, "El contribuyente no puede superar 50 caracteres").optional(),
    direccion: z.string().trim().max(500, "La dirección no puede superar 500 caracteres").optional(),
  }),
};

const router = Router();

router.get("/", authMiddleware, adminOnly, getSettings);
router.put("/", authMiddleware, adminOnly, validate(updateSchema), updateSettings);

export default router;
