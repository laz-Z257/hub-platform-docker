import { z } from "zod";

export const updateUserSchema = {
  body: z.object({
    rol: z.enum(["admin", "user"]).optional(),
    nombre: z.string().min(1).optional(),
    email: z.string().email().optional().or(z.literal("")),
  }),
};
