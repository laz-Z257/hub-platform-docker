import { z } from "zod";

export const sendMessageSchema = {
  body: z.object({
    content: z
      .string({ required_error: "El contenido es requerido" })
      .min(1, "El mensaje no puede estar vacío")
      .max(2000, "El mensaje es demasiado largo"),
  }),
};
