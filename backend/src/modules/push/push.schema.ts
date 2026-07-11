import { z } from "zod";

export const registerPushSchema = z.object({
  token: z
    .string()
    .min(1, "Token requerido")
    .regex(/^[A-Za-z0-9_\-\[\]]+$/, "Token inválido")
    .max(500, "Token demasiado largo"),
});
