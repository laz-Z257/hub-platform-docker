import { Request, Response } from "express";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db } from "../../db";
import { incidents, users } from "../../db/schema";

export async function getKpis(req: Request, res: Response): Promise<void> {
  try {
    const query = req.validatedQuery || req.query;
    const { start, end } = query;
    const dateConditions = [];

    if (typeof start === "string" && start) {
      dateConditions.push(gte(incidents.created_at, new Date(start)));
    }
    if (typeof end === "string" && end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      dateConditions.push(lte(incidents.created_at, endDate));
    }

    const dateFilter = dateConditions.length > 0 ? and(...dateConditions) : undefined;

    const [result] = await db
      .select({
        totalIncidentes: sql<number>`count(*)`.mapWith(Number),
        pendientes:
          sql<number>`count(*) filter (where ${incidents.estado} = 'pendiente')`.mapWith(Number),
        enProceso:
          sql<number>`count(*) filter (where ${incidents.estado} = 'en_proceso')`.mapWith(Number),
        resueltos:
          sql<number>`count(*) filter (where ${incidents.estado} = 'resuelto')`.mapWith(Number),
        altaUrgencia:
          sql<number>`count(*) filter (where ${incidents.urgencia} = 'alta')`.mapWith(Number),
      })
      .from(incidents)
      .where(dateFilter);

    const [usuarioCount] = await db
      .select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(users);

    res.json({
      totalIncidentes: result.totalIncidentes,
      pendientes: result.pendientes,
      enProceso: result.enProceso,
      resueltos: result.resueltos,
      altaUrgencia: result.altaUrgencia,
      usuariosActivos: usuarioCount.total,
    });
  } catch (error) {
    console.error("Get KPIs error:", error);
    res.status(500).json({ error: "Error al obtener métricas" });
  }
}
