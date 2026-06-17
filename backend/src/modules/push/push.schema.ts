import { z } from "zod";

export const registerPushSchema = z.object({
  token: z.string().min(1, "Token requerido"),
});
