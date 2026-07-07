import { Request, Response } from "express";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { db } from "../../db";
import { incidents, users, ratings, puntosVenta, messages } from "../../db/schema";
import { logger } from "../../lib/logger";

function getColombiaNow(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
}

function getTodayRangeColombia(): { start: Date; end: Date } {
  const now = getColombiaNow();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(17, 0, 0, 0);
  return { start, end };
}

export async function getKpis(req: Request, res: Response): Promise<void> {
  try {
    const q = req.validatedQuery!;
    const start = q.start as string | undefined;
    const end = q.end as string | undefined;
    const agente = q.agente as string | undefined;
    const conditions = [];

    if (typeof agente === "string" && agente) {
      conditions.push(eq(incidents.agente, agente));
    }

    if (typeof start === "string" && start) {
      conditions.push(gte(incidents.created_at, new Date(start)));
    }
    if (typeof end === "string" && end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(incidents.created_at, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

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
      .where(whereClause);

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
    logger.error("Get KPIs error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al obtener métricas" });
  }
}

export async function getSummary(_req: Request, res: Response): Promise<void> {
  try {
    const { start: todayStart, end: todayEnd } = getTodayRangeColombia();

    const todayCondition = and(
      gte(incidents.created_at, todayStart),
      lte(incidents.created_at, todayEnd)
    );

    const [todayStats] = await db
      .select({
        nuevos: sql<number>`count(*)`.mapWith(Number),
        pendientes: sql<number>`count(*) filter (where ${incidents.estado} = 'pendiente')`.mapWith(Number),
        enProceso: sql<number>`count(*) filter (where ${incidents.estado} = 'en_proceso')`.mapWith(Number),
        resueltos: sql<number>`count(*) filter (where ${incidents.estado} = 'resuelto')`.mapWith(Number),
        altaUrgencia: sql<number>`count(*) filter (where ${incidents.urgencia} = 'alta')`.mapWith(Number),
        mediaUrgencia: sql<number>`count(*) filter (where ${incidents.urgencia} = 'media')`.mapWith(Number),
        bajaUrgencia: sql<number>`count(*) filter (where ${incidents.urgencia} = 'baja')`.mapWith(Number),
      })
      .from(incidents)
      .where(todayCondition);

    const [totalStats] = await db
      .select({
        total: sql<number>`count(*)`.mapWith(Number),
        pendientes: sql<number>`count(*) filter (where ${incidents.estado} = 'pendiente')`.mapWith(Number),
        enProceso: sql<number>`count(*) filter (where ${incidents.estado} = 'en_proceso')`.mapWith(Number),
        resueltos: sql<number>`count(*) filter (where ${incidents.estado} = 'resuelto')`.mapWith(Number),
      })
      .from(incidents);

    const [avgResolution] = await db
      .select({
        avgHours: sql<string>`COALESCE(AVG(EXTRACT(EPOCH FROM (${incidents.fecha_cierre} - ${incidents.created_at})) / 3600), 0)`.mapWith(String),
      })
      .from(incidents)
      .where(and(
        eq(incidents.estado, "resuelto"),
        sql`${incidents.fecha_cierre} IS NOT NULL`
      ));

    const [userStats] = await db
      .select({
        total: sql<number>`count(*)`.mapWith(Number),
        activos: sql<number>`count(*) filter (where ${users.estado} = 'activo')`.mapWith(Number),
        bloqueados: sql<number>`count(*) filter (where ${users.estado} = 'bloqueado')`.mapWith(Number),
      })
      .from(users);

    const [ratingStats] = await db
      .select({
        promedio: sql<string>`COALESCE(AVG(${ratings.puntuacion}), 0)`.mapWith(String),
        total: sql<number>`count(*)`.mapWith(Number),
      })
      .from(ratings);

    const [pvStats] = await db
      .select({
        total: sql<number>`count(*)`.mapWith(Number),
        activos: sql<number>`count(*) filter (where ${puntosVenta.activo} = true)`.mapWith(Number),
      })
      .from(puntosVenta);

    const recentIncidents = await db
      .select({
        id: incidents.id,
        nombre: incidents.nombre,
        punto_venta: incidents.punto_venta,
        descripcion: incidents.descripcion,
        urgencia: incidents.urgencia,
        estado: incidents.estado,
        created_at: incidents.created_at,
      })
      .from(incidents)
      .orderBy(desc(incidents.created_at))
      .limit(5);

    const recentUsers = await db
      .select({
        id: users.id,
        nombre: users.nombre,
        documento: users.documento,
        rol: users.rol,
        estado: users.estado,
        ultima_actividad: users.ultima_actividad,
        created_at: users.created_at,
      })
      .from(users)
      .orderBy(desc(users.created_at))
      .limit(5);

    const last7Days = [];
    const now = getColombiaNow();
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const [count] = await db
        .select({ total: sql<number>`count(*)`.mapWith(Number) })
        .from(incidents)
        .where(
          and(
            gte(incidents.created_at, day),
            lte(incidents.created_at, nextDay)
          )
        );

      last7Days.push({
        fecha: day.toLocaleDateString("es-CO", { weekday: "short", day: "numeric" }),
        incidentes: count.total,
      });
    }

    const [messageCount] = await db
      .select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(messages);

    res.json({
      hoy: {
        nuevos: todayStats.nuevos,
        pendientes: todayStats.pendientes,
        enProceso: todayStats.enProceso,
        resueltos: todayStats.resueltos,
        altaUrgencia: todayStats.altaUrgencia,
        mediaUrgencia: todayStats.mediaUrgencia,
        bajaUrgencia: todayStats.bajaUrgencia,
      },
      total: {
        incidentes: totalStats.total,
        pendientes: totalStats.pendientes,
        enProceso: totalStats.enProceso,
        resueltos: totalStats.resueltos,
      },
      resolucion: {
        promedioHoras: parseFloat(parseFloat(avgResolution.avgHours).toFixed(1)),
      },
      usuarios: {
        total: userStats.total,
        activos: userStats.activos,
        bloqueados: userStats.bloqueados,
      },
      calificaciones: {
        promedio: parseFloat(parseFloat(ratingStats.promedio).toFixed(1)),
        total: ratingStats.total,
      },
      puntosVenta: {
        total: pvStats.total,
        activos: pvStats.activos,
      },
      mensajes: {
        total: messageCount.total,
      },
      tendencia7Dias: last7Days,
      recientes: {
        tickets: recentIncidents,
        usuarios: recentUsers,
      },
      horaColombia: now.toISOString(),
    });
  } catch (error) {
    logger.error("Get summary error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al obtener resumen" });
  }
}
