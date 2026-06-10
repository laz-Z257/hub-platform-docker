import { z } from "zod";

export const uuidParamsSchema = z.object({ id: z.string().uuid("ID inválido") });

export const updateUserSchema = {
  body: z.object({
    rol: z.enum(["admin", "user"]).optional(),
    nombre: z.string().min(1).optional(),
    email: z.string().email().optional().or(z.literal("")),
  }),
};
