import { z } from "zod";

export const uuidParamsSchema = z.object({ id: z.string().uuid("ID inválido") });

export const createIncidentSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100),
  documento: z.string().min(1, "El documento es requerido").max(20),
  punto_venta: z.string().min(1, "El punto de venta es requerido").max(150),
  telefono: z.string().max(20).optional().default(""),
  descripcion: z.string().min(1, "La descripción es requerida").max(2000),
  urgencia: z.enum(["baja", "media", "alta"]).default("media"),
});

export const updateIncidentSchema = z.object({
  estado: z.enum(["pendiente", "en_proceso", "resuelto"]).optional(),
  agente: z.string().max(100).optional(),
});

export const commentSchema = z.object({
  texto: z.string().min(1, "El comentario es requerido").max(5000),
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

export const statsQuerySchema = {
  query: z.object({
    start: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), "start debe ser una fecha válida"),
    end: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), "end debe ser una fecha válida"),
    agente: z.string().optional(),
  }),
};
