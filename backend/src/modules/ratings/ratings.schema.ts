import { z } from "zod";

export const createRatingSchema = z.object({
  puntuacion: z.number().int().min(1, "La puntuación debe ser entre 1 y 5").max(5, "La puntuación debe ser entre 1 y 5"),
  comentario: z.string().max(1000).optional(),
});

export const ratingParamsSchema = z.object({ id: z.string().uuid("ID inválido") });
