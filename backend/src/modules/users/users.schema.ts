import { z } from "zod";

export const uuidParamsSchema = z.object({ id: z.string().uuid("ID inválido") });

export const listUsersQuerySchema = {
  query: z.object({
    page: z
      .string()
      .optional()
      .default("1")
      .transform(Number)
      .pipe(z.number().int().min(1)),
    limit: z
      .string()
      .optional()
      .default("50")
      .transform(Number)
      .pipe(z.number().int().min(1).max(200)),
    search: z.string().optional(),
    rol: z.enum(["admin", "user"]).optional(),
  }),
};

export const createUserSchema = z.object({
  documento: z.string().min(1, "El documento es requerido").max(20),
  nombre: z.string().min(1, "El nombre es requerido").max(100),
  contrasena: z.string().min(6, "Mínimo 6 caracteres"),
  rol: z.enum(["admin", "user"]).optional().default("user"),
});

export const updateUserSchema = {
  body: z.object({
    rol: z.enum(["admin", "user"]).optional(),
    nombre: z.string().min(1).max(100).optional(),
    email: z.string().email().optional().or(z.literal("")),
  }),
};
