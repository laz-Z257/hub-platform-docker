import { z } from "zod";

export const loginSchema = z.object({
  documento: z.string().min(1, "El documento es requerido").max(20),
  contrasena: z.string().min(4, "Mínimo 4 caracteres"),
});

export const registerSchema = z.object({
  documento: z.string().min(1, "El documento es requerido").max(20),
  nombre: z.string().min(1, "El nombre es requerido").max(100),
  contrasena: z.string().min(6, "Mínimo 6 caracteres"),
});
