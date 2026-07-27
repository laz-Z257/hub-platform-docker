import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { pushTokens } from "../../db/schema";
import { logger } from "../../lib/logger";

export async function registerToken(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { token } = req.body;

    const [existing] = await db
      .select({ id: pushTokens.id, user_id: pushTokens.user_id })
      .from(pushTokens)
      .where(eq(pushTokens.token, token))
      .limit(1);

    if (existing) {
      if (existing.user_id !== req.user!.userId) {
        res.status(409).json({ error: "El token ya está registrado por otro usuario" });
        return;
      }
    } else {
      await db.insert(pushTokens).values({
        user_id: req.user!.userId,
        token,
      });
    }

    res.json({ message: "Token registrado" });
  } catch (error) {
    logger.error("Register push token error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al registrar token" });
  }
}
