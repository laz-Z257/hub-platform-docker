import { Request, Response } from "express";
import { eq, ilike, or, and, desc, gte, lte, isNotNull, ne, inArray, sql } from "drizzle-orm";
import { db } from "../../db";
import { incidents, incidentComments, users, messages, pushTokens } from "../../db/schema";

export async function createIncident(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const [incident] = await db
      .insert(incidents)
      .values({
        user_id: req.user!.userId,
        nombre: req.body.nombre,
        documento: req.body.documento,
        punto_venta: req.body.punto_venta,
        telefono: req.body.telefono || "",
        descripcion: req.body.descripcion,
        urgencia: req.body.urgencia || "media",
        estado: "pendiente",
        visto_por_admin: false,
      })
      .returning();

    res.status(201).json(incident);
  } catch (error) {
    console.error("Create incident error:", error);
    res.status(500).json({ error: "Error al crear el incidente" });
  }
}

export async function listIncidents(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const q = req.validatedQuery!;
    const page = q.page as number;
    const limit = q.limit as number;
    const offset = (page - 1) * limit;
    const search = q.search as string | undefined;
    const estado = q.estado as string | undefined;
    const urgencia = q.urgencia as string | undefined;

    const conditions = [];

    // Non-admin users only see their own incidents
    if (req.user!.rol !== "admin" && req.user!.rol !== "tecnico") {
      conditions.push(eq(incidents.user_id, req.user!.userId));
    }

    if (search) {
      const cleanSearch = search.replace(/[#\-\s]/g, "");
      conditions.push(
        or(
          ilike(incidents.id, `%${search}%`),
          ilike(incidents.nombre, `%${search}%`),
          ilike(incidents.punto_venta, `%${search}%`),
          ilike(incidents.descripcion, `%${search}%`),
          sql`replace(${incidents.id}::text, '-', '') ILIKE ${`%${cleanSearch}%`}`
        )
      );
    }

    if (estado) {
      conditions.push(
        eq(incidents.estado, estado as "pendiente" | "en_proceso" | "resuelto")
      );
    }

    if (urgencia) {
      conditions.push(
        eq(incidents.urgencia, urgencia as "baja" | "media" | "alta")
      );
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.$count(
      incidents,
      whereClause
    );

    const items = await db
      .select()
      .from(incidents)
      .where(whereClause)
      .orderBy(desc(incidents.created_at))
      .limit(limit)
      .offset(offset);

    res.json({
      items,
      total: totalResult,
      page,
      limit,
      totalPages: Math.ceil(totalResult / limit),
    });
  } catch (error) {
    console.error("List incidents error:", error);
    res.status(500).json({ error: "Error al listar incidentes" });
  }
}

export async function getIncident(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params as { id: string };

    const [incident] = await db
      .select()
      .from(incidents)
      .where(eq(incidents.id, id))
      .limit(1);

    if (!incident) {
      res.status(404).json({ error: "Incidente no encontrado" });
      return;
    }

    // Non-admin users can only see their own incidents
    if (req.user!.rol !== "admin" && req.user!.rol !== "tecnico" && incident.user_id !== req.user!.userId) {
      res.status(403).json({ error: "Acceso denegado" });
      return;
    }

    let cerrado_por_nombre: string | null = null;
    if (incident.cerrado_por) {
      const [user] = await db
        .select({ nombre: users.nombre })
        .from(users)
        .where(eq(users.id, incident.cerrado_por))
        .limit(1);
      cerrado_por_nombre = user?.nombre || null;
    }

    const comments = await db
      .select()
      .from(incidentComments)
      .where(eq(incidentComments.incident_id, id))
      .orderBy(desc(incidentComments.fecha));

    res.json({ ...incident, cerrado_por_nombre, comments });
  } catch (error) {
    console.error("Get incident error:", error);
    res.status(500).json({ error: "Error al obtener el incidente" });
  }
}

export async function updateIncident(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { estado, agente, solucion, imagen_url } = req.body;

    const updateData: Record<string, unknown> = { updated_at: new Date() };
    if (estado) updateData.estado = estado;
    if (agente !== undefined) updateData.agente = agente;
    if (solucion !== undefined) updateData.solucion = solucion;
    if (imagen_url !== undefined) updateData.imagen_url = imagen_url;

    if (estado === "resuelto") {
      updateData.cerrado_por = req.user!.userId;
      updateData.fecha_cierre = new Date();
    }

    const [updated] = await db
      .update(incidents)
      .set(updateData)
      .where(eq(incidents.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Incidente no encontrado" });
      return;
    }

    // Send chat notification when ticket is resolved
    if (estado === "resuelto") {
      const shortId = id.replace(/-/g, "").slice(-8).toUpperCase();
      const botMessage = `✅ Tu ticket #TK-${shortId} ha sido marcado como **Resuelto**.\n\n${solucion ? `**Solución:** ${solucion}\n\n` : ""}Si necesitas más ayuda, no dudes en escribirnos. ¡Gracias por contactarnos!`;

      await db.insert(messages).values({
        user_id: updated.user_id,
        content: botMessage,
        is_bot: true,
      });

      // Send push notification
      try {
        const userTokens = await db
          .select({ token: pushTokens.token })
          .from(pushTokens)
          .where(eq(pushTokens.user_id, updated.user_id));

        if (userTokens.length > 0) {
          const pushMessages = userTokens.map((t) => ({
            to: t.token,
            sound: "default" as const,
            title: "Ticket resuelto",
            body: `Tu ticket #TK-${shortId} ha sido resuelto.${solucion ? ` Solución: ${solucion}` : ""}`,
            data: { incidentId: id },
          }));

          await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pushMessages),
          });
        }
      } catch (pushErr) {
        console.error("Push notification error:", pushErr);
      }
    }

    res.json(updated);
  } catch (error) {
    console.error("Update incident error:", error);
    res.status(500).json({ error: "Error al actualizar el incidente" });
  }
}

export async function addComment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { texto } = req.body;

    const [incident] = await db
      .select()
      .from(incidents)
      .where(eq(incidents.id, id))
      .limit(1);

    if (!incident) {
      res.status(404).json({ error: "Incidente no encontrado" });
      return;
    }

    if (req.user!.rol !== "admin" && req.user!.rol !== "tecnico" && incident.user_id !== req.user!.userId) {
      res.status(403).json({ error: "No puedes comentar incidentes de otros usuarios" });
      return;
    }

    const [user] = await db
      .select({ nombre: users.nombre })
      .from(users)
      .where(eq(users.id, req.user!.userId))
      .limit(1);

    const autor = user?.nombre || req.user!.documento;

    const [comment] = await db
      .insert(incidentComments)
      .values({
        incident_id: id,
        autor,
        texto,
      })
      .returning();

    res.status(201).json(comment);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: "Error al agregar comentario" });
  }
}

export async function exportIncidents(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const start = req.query.start as string | undefined;
    const end = req.query.end as string | undefined;
    const conditions = [];

    if (start) {
      conditions.push(gte(incidents.created_at, new Date(start)));
    }
    if (end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(incidents.created_at, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const allIncidents = await db
      .select()
      .from(incidents)
      .where(whereClause)
      .orderBy(desc(incidents.created_at));

    const incidentIds = allIncidents.map((inc) => inc.id);

    const allComments = incidentIds.length > 0
      ? await db
          .select()
          .from(incidentComments)
          .where(inArray(incidentComments.incident_id, incidentIds))
          .orderBy(desc(incidentComments.fecha))
      : [];

    const commentsByIncident = new Map<string, typeof allComments>();
    for (const comment of allComments) {
      const list = commentsByIncident.get(comment.incident_id) || [];
      list.push(comment);
      commentsByIncident.set(comment.incident_id, list);
    }

    const result = allIncidents.map((inc) => ({
      ...inc,
      comments: commentsByIncident.get(inc.id) || [],
    }));

    res.json({ items: result, total: result.length });
  } catch (error) {
    console.error("Export incidents error:", error);
    res.status(500).json({ error: "Error al exportar incidentes" });
  }
}

export async function getAgentes(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const agentes = await db
      .selectDistinct({ agente: incidents.agente })
      .from(incidents)
      .where(and(isNotNull(incidents.agente), ne(incidents.agente, "")));

    res.json(agentes.map((a) => a.agente).filter(Boolean));
  } catch (error) {
    console.error("Get agentes error:", error);
    res.status(500).json({ error: "Error al listar agentes" });
  }
}

export async function getStats(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const q = req.validatedQuery!;
    const start = q.start as string | undefined;
    const end = q.end as string | undefined;
    const agente = q.agente as string | undefined;
    const conditions = [];

    if (agente) {
      conditions.push(eq(incidents.agente, agente));
    }

    if (start) {
      conditions.push(gte(incidents.created_at, new Date(start)));
    }
    if (end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(incidents.created_at, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const allIncidents = await db
      .select({
        created_at: incidents.created_at,
        urgencia: incidents.urgencia,
        estado: incidents.estado,
        punto_venta: incidents.punto_venta,
      })
      .from(incidents)
      .where(whereClause);

    // Group by day for area chart
    const dayMap = new Map<string, { total: number; resueltos: number }>();
    for (const inc of allIncidents) {
      const day = new Date(inc.created_at).toISOString().split("T")[0];
      const entry = dayMap.get(day) || { total: 0, resueltos: 0 };
      entry.total++;
      if (inc.estado === "resuelto") entry.resueltos++;
      dayMap.set(day, entry);
    }

    const timeline = Array.from(dayMap.entries())
      .map(([date, counts]) => ({
        date,
        fecha: new Date(date + "T00:00:00").toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
        }),
        incidentes: counts.total,
        resueltos: counts.resueltos,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Distribution by punto de venta
    const pvCount = new Map<string, number>();
    for (const inc of allIncidents) {
      const pv = inc.punto_venta || "Sin especificar";
      pvCount.set(pv, (pvCount.get(pv) || 0) + 1);
    }

    const colors = ["#25207E", "#7C3AED", "#3B82F6", "#F59E0B", "#EF4444", "#22C55E", "#EC4899", "#14B8A6"];
    const sorted = Array.from(pvCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const total = allIncidents.length;
    const distribution = total === 0
      ? [{ name: "Sin datos", value: 100, color: "#E5E7EB" }]
      : sorted.map(([name, count], i) => ({
          name,
          value: Math.round((count / total) * 100),
          color: colors[i % colors.length],
        }));

    // Status counts for bar chart
    const statusCounts = {
      pendientes: 0,
      enProceso: 0,
      resueltos: 0,
    };
    for (const inc of allIncidents) {
      if (inc.estado === "pendiente") statusCounts.pendientes++;
      else if (inc.estado === "en_proceso") statusCounts.enProceso++;
      else if (inc.estado === "resuelto") statusCounts.resueltos++;
    }

    res.json({ timeline, distribution, statusCounts });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
}

export async function unreadCount(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(incidents)
      .where(and(eq(incidents.visto_por_admin, false), eq(incidents.estado, "pendiente")));

    res.json({ count: result.count });
  } catch (error) {
    console.error("Unread count error:", error);
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
}

export async function markSeen(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    await db
      .update(incidents)
      .set({ visto_por_admin: true })
      .where(and(eq(incidents.visto_por_admin, false), eq(incidents.estado, "pendiente")));

    res.json({ message: "Marcados como vistos" });
  } catch (error) {
    console.error("Mark seen error:", error);
    res.status(500).json({ error: "Error al marcar como vistos" });
  }
}

export async function deleteIncident(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params as { id: string };

    const [deleted] = await db
      .delete(incidents)
      .where(eq(incidents.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Incidente no encontrado" });
      return;
    }

    res.json({ message: "Incidente eliminado", id: deleted.id });
  } catch (error) {
    console.error("Delete incident error:", error);
    res.status(500).json({ error: "Error al eliminar el incidente" });
  }
}
