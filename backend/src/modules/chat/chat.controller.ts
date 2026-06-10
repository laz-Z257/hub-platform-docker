import { Request, Response } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../../db";
import { messages } from "../../db/schema";

const DEFAULT_BOT_RESPONSE =
  "Gracias por tu mensaje. Un agente revisará tu consulta y te responderá pronto. ¿Necesitas ayuda con algo más?";

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

    const botText = DEFAULT_BOT_RESPONSE;

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
