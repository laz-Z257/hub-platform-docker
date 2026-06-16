import { Request, Response } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db } from "../../db";
import { ratings, incidents } from "../../db/schema";

export async function createRating(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { puntuacion, comentario } = req.body;

    const [incident] = await db
      .select({ id: incidents.id, user_id: incidents.user_id, estado: incidents.estado })
      .from(incidents)
      .where(eq(incidents.id, id))
      .limit(1);

    if (!incident) {
      res.status(404).json({ error: "Incidente no encontrado" });
      return;
    }

    if (incident.estado !== "resuelto") {
      res.status(400).json({ error: "Solo puedes calificar tickets resueltos" });
      return;
    }

    if (req.user!.rol !== "admin" && incident.user_id !== req.user!.userId) {
      res.status(403).json({ error: "No puedes calificar incidentes de otros usuarios" });
      return;
    }

    const [existing] = await db
      .select({ id: ratings.id })
      .from(ratings)
      .where(eq(ratings.incident_id, id))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(ratings)
        .set({ puntuacion, comentario: comentario || null })
        .where(eq(ratings.incident_id, id))
        .returning();
      res.json(updated);
      return;
    }

    const [rating] = await db
      .insert(ratings)
      .values({
        incident_id: id,
        user_id: req.user!.userId,
        puntuacion,
        comentario: comentario || null,
      })
      .returning();

    res.status(201).json(rating);
  } catch (error) {
    console.error("Create rating error:", error);
    res.status(500).json({ error: "Error al guardar la calificación" });
  }
}

export async function getRating(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };

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
    console.error("Get rating error:", error);
    res.status(500).json({ error: "Error al obtener la calificación" });
  }
}

export async function getRatingStats(_req: Request, res: Response): Promise<void> {
  try {
    const allRatings = await db
      .select({
        puntuacion: ratings.puntuacion,
        comentario: ratings.comentario,
        created_at: ratings.created_at,
        incident_id: ratings.incident_id,
      })
      .from(ratings)
      .orderBy(desc(ratings.created_at));

    const total = allRatings.length;
    const sum = allRatings.reduce((acc, r) => acc + r.puntuacion, 0);
    const promedio = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

    const distribucion: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of allRatings) {
      distribucion[r.puntuacion] = (distribucion[r.puntuacion] || 0) + 1;
    }

    res.json({
      promedio,
      total,
      distribucion,
      ultimas: allRatings.slice(0, 10),
    });
  } catch (error) {
    console.error("Get rating stats error:", error);
    res.status(500).json({ error: "Error al obtener estadísticas de calificaciones" });
  }
}
