import { Request, Response } from "express";
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "../../db";
import { messages, incidents } from "../../db/schema";

const DEFAULT_BOT_RESPONSE =
  "Gracias por tu mensaje. Un agente revisará tu consulta y te responderá pronto. ¿Necesitas ayuda con algo más?";

const ESTADO_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_proceso: "En Proceso",
  resuelto: "Resuelto",
};

async function lookupTicket(
  userId: string,
  text: string
): Promise<string | null> {
  const match = text.match(/(?:#?TK-)?([A-Fa-f0-9]{4,8})/);
  if (!match) return null;

  const shortId = match[1].toUpperCase();

  const [incident] = await db
    .select({
      id: incidents.id,
      descripcion: incidents.descripcion,
      estado: incidents.estado,
      created_at: incidents.created_at,
    })
    .from(incidents)
    .where(
      and(
        eq(incidents.user_id, userId),
        sql`UPPER(RIGHT(REPLACE(${incidents.id}::text, '-', ''), 8)) LIKE ${'%' + shortId}`
      )
    )
    .limit(1);

  if (!incident) return null;

  const estado = ESTADO_LABELS[incident.estado] || incident.estado;
  const fecha = new Date(incident.created_at).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
  });

  return (
    `✅ Ticket #TK-${shortId}\n\n` +
    `📋 ${incident.descripcion.slice(0, 80)}${incident.descripcion.length > 80 ? "..." : ""}\n` +
    `📅 Creado el ${fecha}\n` +
    `📌 Estado: **${estado}**`
  );
}

export async function sendMessage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { content } = req.body;

    const [userMsg] = await db
      .insert(messages)
      .values({
        user_id: req.user!.userId,
        content,
        is_bot: false,
      })
      .returning();

    const ticketInfo = await lookupTicket(req.user!.userId, content);
    const botText = ticketInfo || DEFAULT_BOT_RESPONSE;

    const [botMsg] = await db
      .insert(messages)
      .values({
        user_id: req.user!.userId,
        content: botText,
        is_bot: true,
      })
      .returning();

    // Simulate delay for more realistic chat
    res.json({ userMessage: userMsg, botMessage: botMsg });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
}

export async function getHistory(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const limit = (req.validatedQuery?.limit as number) || parseInt(req.query.limit as string) || 50;

    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.user_id, req.user!.userId))
      .orderBy(desc(messages.created_at))
      .limit(limit);

    res.json(history.reverse());
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
}
