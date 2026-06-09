import { z } from "zod";

export const createIncidentSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  documento: z.string().min(1, "El documento es requerido"),
  punto_venta: z.string().min(1, "El punto de venta es requerido"),
  telefono: z.string().optional().default(""),
  descripcion: z.string().min(1, "La descripción es requerida"),
  urgencia: z.enum(["baja", "media", "alta"]).default("media"),
});

export const updateIncidentSchema = z.object({
  estado: z.enum(["pendiente", "en_proceso", "resuelto"]).optional(),
  agente: z.string().optional(),
});

export const commentSchema = z.object({
  texto: z.string().min(1, "El comentario es requerido"),
});

export const listIncidentsQuerySchema = {
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
      .default("20")
      .transform(Number)
      .pipe(z.number().int().min(1).max(100)),
    search: z.string().optional(),
    estado: z.enum(["pendiente", "en_proceso", "resuelto"]).optional(),
    urgencia: z.enum(["baja", "media", "alta"]).optional(),
  }),
};
