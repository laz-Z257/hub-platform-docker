import { z } from "zod";

export const loginSchema = z.object({
  documento: z.string().min(1, "El documento es requerido"),
  contrasena: z.string().min(4, "Mínimo 4 caracteres"),
});

export const registerSchema = z.object({
  documento: z.string().min(1, "El documento es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  contrasena: z.string().min(6, "Mínimo 6 caracteres"),
});
