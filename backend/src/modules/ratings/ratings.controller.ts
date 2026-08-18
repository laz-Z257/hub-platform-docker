import { Request, Response } from "express";
import { eq, desc, and, isNull, sql } from "drizzle-orm";
import { db } from "../../db";
import { ratings, incidents, users } from "../../db/schema";
import { logger } from "../../lib/logger";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export async function createRating(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { puntuacion, comentario } = req.body;

    if (typeof puntuacion !== "number" || puntuacion < 1 || puntuacion > 5) {
      res.status(400).json({ error: "La puntuación debe ser un número entre 1 y 5" });
      return;
    }

    const [incident] = await db
      .select({ id: incidents.id, user_id: incidents.user_id, estado: incidents.estado })
      .from(incidents)
      .where(and(eq(incidents.id, id), isNull(incidents.deleted_at)))
      .limit(1);

    if (!incident) {
      res.status(404).json({ error: "Incidente no encontrado" });
      return;
    }

    if (incident.estado !== "resuelto") {
      res.status(400).json({ error: "Solo puedes calificar tickets resueltos" });
      return;
    }

    if (req.user!.rol !== "admin" && req.user!.rol !== "tecnico" && incident.user_id !== req.user!.userId) {
      res.status(403).json({ error: "No puedes calificar incidentes de otros usuarios" });
      return;
    }

    const [existing] = await db
      .select({ id: ratings.id })
      .from(ratings)
      .where(eq(ratings.incident_id, id))
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "Este ticket ya fue calificado" });
      return;
    }

    const [rating] = await db
      .insert(ratings)
      .values({
        incident_id: id,
        user_id: incident.user_id,
        puntuacion,
        comentario: comentario || null,
      })
      .returning();

    res.status(201).json(rating);
  } catch (error) {
    logger.error("Create rating error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al guardar la calificación" });
  }
}

export async function getRating(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };

    const [incident] = await db
      .select({ id: incidents.id, user_id: incidents.user_id })
      .from(incidents)
      .where(and(eq(incidents.id, id), isNull(incidents.deleted_at)))
      .limit(1);

    if (!incident) {
      res.status(404).json({ error: "Incidente no encontrado" });
      return;
    }

    if (
      req.user!.rol !== "admin" &&
      req.user!.rol !== "tecnico" &&
      incident.user_id !== req.user!.userId
    ) {
      res.status(403).json({ error: "Acceso denegado" });
      return;
    }

    const [rating] = await db
      .select()
      .from(ratings)
      .where(eq(ratings.incident_id, id))
      .limit(1);

    if (!rating) {
      res.status(404).json({ error: "Calificación no encontrada" });
      return;
    }

    res.json(rating);
  } catch (error) {
    logger.error("Get rating error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al obtener la calificación" });
  }
}

export async function getMyRatedIncidents(req: Request, res: Response): Promise<void> {
  try {
    const rows = await db
      .select({ incident_id: ratings.incident_id })
      .from(ratings)
      .innerJoin(incidents, and(eq(ratings.incident_id, incidents.id), isNull(incidents.deleted_at)))
      .where(eq(ratings.user_id, req.user!.userId));

    res.json({ ratedIncidentIds: rows.map((r) => r.incident_id) });
  } catch (error) {
    logger.error("Get my rated incidents error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al obtener calificaciones" });
  }
}

export async function getRatingStats(_req: Request, res: Response): Promise<void> {
  try {
    // Agregación en SQL (GROUP BY): no carga todas las filas en memoria.
    // La forma de la respuesta es idéntica a la versión anterior.
    const ratingsJoin = and(
      eq(ratings.incident_id, incidents.id),
      isNull(incidents.deleted_at)
    );

    const [agg] = await db
      .select({
        total: sql<number>`count(*)::int`,
        sum: sql<number>`coalesce(sum(${ratings.puntuacion}), 0)::int`,
      })
      .from(ratings)
      .innerJoin(incidents, ratingsJoin);

    const total = agg?.total ?? 0;
    const sum = agg?.sum ?? 0;
    const promedio = total > 0 ? round1(sum / total) : 0;

    const distribucion: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const distRows = await db
      .select({ puntuacion: ratings.puntuacion, count: sql<number>`count(*)::int` })
      .from(ratings)
      .innerJoin(incidents, ratingsJoin)
      .groupBy(ratings.puntuacion);
    for (const r of distRows) {
      distribucion[r.puntuacion] = r.count;
    }

    const timelineRows = await db
      .select({
        fecha: sql<string>`to_char(${ratings.created_at}, 'YYYY-MM-DD')`,
        suma: sql<number>`coalesce(sum(${ratings.puntuacion}), 0)::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(ratings)
      .innerJoin(incidents, ratingsJoin)
      .groupBy(sql`to_char(${ratings.created_at}, 'YYYY-MM-DD')`);
    const timeline = timelineRows
      .map((d) => ({ fecha: d.fecha, promedio: round1(d.suma / d.count), total: d.count }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    const pvRows = await db
      .select({
        punto_venta: incidents.punto_venta,
        suma: sql<number>`coalesce(sum(${ratings.puntuacion}), 0)::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(ratings)
      .innerJoin(incidents, ratingsJoin)
      .groupBy(incidents.punto_venta);
    const promedioPv = pvRows
      .map((d) => ({
        punto_venta: d.punto_venta || "Sin especificar",
        promedio: round1(d.suma / d.count),
        total: d.count,
      }))
      .sort((a, b) => b.promedio - a.promedio);

    const ultimas = await db
      .select({
        puntuacion: ratings.puntuacion,
        comentario: ratings.comentario,
        created_at: ratings.created_at,
        incident_id: ratings.incident_id,
        usuario_nombre: users.nombre,
        punto_venta: incidents.punto_venta,
        ticket_descripcion: incidents.descripcion,
      })
      .from(ratings)
      .innerJoin(incidents, ratingsJoin)
      .innerJoin(users, and(eq(ratings.user_id, users.id), isNull(users.deleted_at)))
      .orderBy(desc(ratings.created_at))
      .limit(10);

    res.json({
      promedio,
      total,
      distribucion,
      promedioPv,
      timeline,
      ultimas,
    });
  } catch (error) {
    logger.error("Get rating stats error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al obtener estadísticas de calificaciones" });
  }
}

export async function getPublicRatingStats(_req: Request, res: Response): Promise<void> {
  try {
    // Agregación en SQL: no carga todas las filas en memoria
    const ratingsJoin = and(
      eq(ratings.incident_id, incidents.id),
      isNull(incidents.deleted_at)
    );

    const [agg] = await db
      .select({
        total: sql<number>`count(*)::int`,
        sum: sql<number>`coalesce(sum(${ratings.puntuacion}), 0)::int`,
      })
      .from(ratings)
      .innerJoin(incidents, ratingsJoin);

    const total = agg?.total ?? 0;
    const sum = agg?.sum ?? 0;
    const promedio = total > 0 ? round1(sum / total) : 0;

    const distribucion: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const distRows = await db
      .select({ puntuacion: ratings.puntuacion, count: sql<number>`count(*)::int` })
      .from(ratings)
      .innerJoin(incidents, ratingsJoin)
      .groupBy(ratings.puntuacion);
    for (const r of distRows) {
      distribucion[r.puntuacion] = r.count;
    }

    const pvRows = await db
      .select({
        punto_venta: incidents.punto_venta,
        suma: sql<number>`coalesce(sum(${ratings.puntuacion}), 0)::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(ratings)
      .innerJoin(incidents, ratingsJoin)
      .groupBy(incidents.punto_venta);
    const promedioPv = pvRows
      .map((d) => ({
        punto_venta: d.punto_venta || "Sin especificar",
        promedio: round1(d.suma / d.count),
        total: d.count,
      }))
      .sort((a, b) => b.promedio - a.promedio);

    res.json({
      promedio,
      total,
      distribucion,
      promedioPv,
    });
  } catch (error) {
    logger.error("Get public rating stats error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al obtener estadísticas públicas" });
  }
}
