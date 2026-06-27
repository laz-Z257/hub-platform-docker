import { z } from "zod";

export const kpisQuerySchema = {
  query: z.object({
    start: z
      .string()
      .optional()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        "start debe ser una fecha válida"
      ),
    end: z
      .string()
      .optional()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        "end debe ser una fecha válida"
      ),
    agente: z.string().optional(),
  }),
};
