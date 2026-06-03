import { z } from "zod";

export const loginSchema = z.object({
  documento: z.string().min(1, "El documento es requerido"),
  contrasena: z.string().min(4, "Mínimo 4 caracteres"),
});
