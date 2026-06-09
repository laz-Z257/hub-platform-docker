import { Request, Response } from "express";
import { eq, ilike, or, and, desc, gte, lte } from "drizzle-orm";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "../../db";
import { incidents, incidentComments, users } from "../../db/schema";

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
      })
      .returning();

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.documento, req.body.documento))
      .limit(1);

    if (!existingUser) {
      const randomPwd = crypto.randomBytes(16).toString("hex");
      const hashed = await bcrypt.hash(randomPwd, 10);

      await db.insert(users).values({
        documento: req.body.documento,
        nombre: req.body.nombre,
        email: `${req.body.documento}@hub.ai`,
        contrasena: hashed,
        rol: "user",
      });
    }

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
    if (req.user!.rol !== "admin") {
      conditions.push(eq(incidents.user_id, req.user!.userId));
    }

    if (search) {
      conditions.push(
        or(
          ilike(incidents.nombre, `%${search}%`),
          ilike(incidents.punto_venta, `%${search}%`),
          ilike(incidents.descripcion, `%${search}%`)
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
    if (req.user!.rol !== "admin" && incident.user_id !== req.user!.userId) {
      res.status(403).json({ error: "Acceso denegado" });
      return;
    }

    const comments = await db
      .select()
      .from(incidentComments)
      .where(eq(incidentComments.incident_id, id))
      .orderBy(desc(incidentComments.fecha));

    res.json({ ...incident, comments });
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
    const { estado, agente } = req.body;

    const updateData: Record<string, unknown> = { updated_at: new Date() };
    if (estado) updateData.estado = estado;
    if (agente !== undefined) updateData.agente = agente;

    const [updated] = await db
      .update(incidents)
      .set(updateData)
      .where(eq(incidents.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Incidente no encontrado" });
      return;
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

export async function getStats(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { start, end } = req.query;
    const conditions = [];

    if (typeof start === "string" && start) {
      conditions.push(
        gte(incidents.created_at, new Date(start))
      );
    }
    if (typeof end === "string" && end) {
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

    // Distribution by urgency
    const urgenciaTotal = { alta: 0, media: 0, baja: 0 };
    for (const inc of allIncidents) {
      if (inc.urgencia === "alta") urgenciaTotal.alta++;
      else if (inc.urgencia === "media") urgenciaTotal.media++;
      else urgenciaTotal.baja++;
    }

    const total = allIncidents.length;
    const distribution = total === 0
      ? [
          { name: "Alta", value: 0, color: "#EF4444" },
          { name: "Media", value: 0, color: "#F59E0B" },
          { name: "Baja", value: 0, color: "#22C55E" },
        ]
      : [
      {
        name: "Alta",
        value: Math.round((urgenciaTotal.alta / total) * 100),
        color: "#EF4444",
      },
      {
        name: "Media",
        value: Math.round((urgenciaTotal.media / total) * 100),
        color: "#F59E0B",
      },
      {
        name: "Baja",
        value: total > 0
          ? 100 - Math.round((urgenciaTotal.alta / total) * 100) - Math.round((urgenciaTotal.media / total) * 100)
          : 0,
        color: "#22C55E",
      },
    ];

    res.json({ timeline, distribution });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
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
