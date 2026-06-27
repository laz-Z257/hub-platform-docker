import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { companySettings } from "../../db/schema";
import { logger } from "../../lib/logger";

export async function getSettings(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const [settings] = await db
      .select()
      .from(companySettings)
      .limit(1);

    res.json(
      settings || { nombre: "", contribuyente: "", direccion: "" }
    );
  } catch (error) {
    logger.error("Get settings error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al obtener configuración" });
  }
}

export async function updateSettings(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { nombre, contribuyente, direccion } = req.body;

    const [existing] = await db
      .select({ id: companySettings.id })
      .from(companySettings)
      .limit(1);

    let result: typeof companySettings.$inferSelect;
    if (existing) {
      [result] = await db
        .update(companySettings)
        .set({
          nombre: nombre ?? "",
          contribuyente: contribuyente ?? "",
          direccion: direccion ?? "",
          updated_at: new Date(),
        })
        .where(eq(companySettings.id, existing.id))
        .returning();
    } else {
      [result] = await db
        .insert(companySettings)
        .values({
          nombre: nombre ?? "",
          contribuyente: contribuyente ?? "",
          direccion: direccion ?? "",
        })
        .returning();
    }

    res.json(result);
  } catch (error) {
    logger.error("Update settings error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al actualizar configuración" });
  }
}
