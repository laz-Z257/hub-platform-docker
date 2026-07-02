import { Router } from "express";
import { z } from "zod";
import { getSettings, updateSettings } from "./settings.controller";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/admin";
import { validate } from "../../middlewares/validate";

const updateSchema = {
  body: z.object({
    nombre: z.string().optional(),
    contribuyente: z.string().optional(),
    direccion: z.string().optional(),
  }),
};

const router = Router();

router.get("/", authMiddleware, getSettings);
router.put("/", authMiddleware, adminOnly, validate(updateSchema), updateSettings);

export default router;
