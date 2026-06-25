import { z } from "zod";

export const AuthUserSchema = z.object({
  id: z.string(),
  documento: z.string(),
  nombre: z.string(),
  rol: z.enum(["user", "asesor", "admin", "tecnico"]),
  estado: z.enum(["activo", "bloqueado"]).optional(),
  ultima_actividad: z.string().optional(),
  bloqueado_por: z.string().nullable().optional(),
});

export const IncidentSchema = z.object({
  id: z.string(),
  usuario_id: z.string(),
  titulo: z.string(),
  descripcion: z.string(),
  estado: z.string(),
  urgencia: z.string(),
  agente: z.string().nullable().optional(),
  solucion: z.string().nullable().optional(),
  imagen_url: z.string().nullable().optional(),
  creado_en: z.string(),
  actualizado_en: z.string().optional(),
  cerrado_por: z.string().nullable().optional(),
  fecha_cierre: z.string().nullable().optional(),
});

export const IncidentListSchema = z.array(IncidentSchema);

export const UserSchema = z.object({
  id: z.string(),
  documento: z.string(),
  nombre: z.string(),
  rol: z.enum(["user", "asesor", "admin", "tecnico"]),
  estado: z.enum(["activo", "bloqueado"]),
  ultima_actividad: z.string().nullable().optional(),
  intentos_fallidos: z.number().optional(),
  creado_en: z.string().optional(),
  bloqueado_por: z.string().nullable().optional(),
  bloqueado_por_documento: z.string().nullable().optional(),
});

export const UserListSchema = z.array(UserSchema);

export const RatingSchema = z.object({
  id: z.string(),
  incidente_id: z.string(),
  usuario_id: z.string(),
  usuario_nombre: z.string().optional(),
  punto_venta: z.string().optional(),
  ticket: z.string().optional(),
  puntuacion: z.number(),
  comentario: z.string().nullable().optional(),
  creado_en: z.string(),
});

export const RatingListSchema = z.array(RatingSchema);

export const KpiSchema = z.object({
  tickets: z.number(),
  usuarios: z.number(),
  resueltos: z.number(),
  pendientes: z.number().optional(),
  enProceso: z.number().optional(),
  promedioCalificacion: z.number().optional(),
  totalCalificaciones: z.number().optional(),
});

export const StatsSchema = z.object({
  timeline: z.array(z.object({
    fecha: z.string(),
    creados: z.number().optional(),
    resueltos: z.number().optional(),
  })),
  urgencia: z.array(z.object({
    urgencia: z.string(),
    cantidad: z.number(),
  })),
  agentes: z.array(z.object({
    agente: z.string(),
    cantidad: z.number(),
  })),
  promedio: z.number().optional(),
});
