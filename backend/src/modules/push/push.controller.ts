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
      .select({ id: pushTokens.id })
      .from(pushTokens)
      .where(eq(pushTokens.token, token))
      .limit(1);

    if (existing) {
      await db
        .update(pushTokens)
        .set({ user_id: req.user!.userId })
        .where(eq(pushTokens.id, existing.id));
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
