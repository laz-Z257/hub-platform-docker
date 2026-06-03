import { Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { incidents, users } from "../../db/schema";

export async function getKpis(_req: Request, res: Response): Promise<void> {
  try {
    const totalResult = await db.$count(incidents);
    const pendientesResult = await db.$count(
      incidents,
      eq(incidents.estado, "pendiente")
    );
    const enProcesoResult = await db.$count(
      incidents,
      eq(incidents.estado, "en_proceso")
    );
    const resueltosResult = await db.$count(
      incidents,
      eq(incidents.estado, "resuelto")
    );
    const altaUrgenciaResult = await db.$count(
      incidents,
      eq(incidents.urgencia, "alta")
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
