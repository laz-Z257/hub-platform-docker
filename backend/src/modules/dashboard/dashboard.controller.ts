import { Request, Response } from "express";
import { eq, and, gte, lte } from "drizzle-orm";
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

    const totalResult = await db.$count(incidents, dateFilter);
    const pendientesResult = await db.$count(
      incidents,
      dateFilter ? and(dateFilter, eq(incidents.estado, "pendiente")) : eq(incidents.estado, "pendiente")
    );
    const enProcesoResult = await db.$count(
      incidents,
      dateFilter ? and(dateFilter, eq(incidents.estado, "en_proceso")) : eq(incidents.estado, "en_proceso")
    );
    const resueltosResult = await db.$count(
      incidents,
      dateFilter ? and(dateFilter, eq(incidents.estado, "resuelto")) : eq(incidents.estado, "resuelto")
    );
    const altaUrgenciaResult = await db.$count(
      incidents,
      dateFilter ? and(dateFilter, eq(incidents.urgencia, "alta")) : eq(incidents.urgencia, "alta")
    );

    const usuariosActivos = await db.$count(users);

    res.json({
      totalIncidentes: totalResult,
      pendientes: pendientesResult,
      enProceso: enProcesoResult,
      resueltos: resueltosResult,
      altaUrgencia: altaUrgenciaResult,
      usuariosActivos,
    });
  } catch (error) {
    console.error("Get KPIs error:", error);
    res.status(500).json({ error: "Error al obtener métricas" });
  }
}
