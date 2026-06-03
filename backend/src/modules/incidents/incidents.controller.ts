import { Request, Response } from "express";
import { eq, ilike, or, and, desc } from "drizzle-orm";
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string | undefined;
    const estado = req.query.estado as string | undefined;
    const urgencia = req.query.urgencia as string | undefined;

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
    const { id } = req.params;

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
    const { id } = req.params;
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
    const { id } = req.params;
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
