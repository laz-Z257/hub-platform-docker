import { Request, Response } from "express";
import { sql } from "drizzle-orm";
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

    const [result] = await db
      .insert(companySettings)
      .values({
        key: "default",
        nombre: nombre ?? "",
        contribuyente: contribuyente ?? "",
        direccion: direccion ?? "",
      })
      .onConflictDoUpdate({
        target: companySettings.key,
        set: {
          nombre: sql`excluded.nombre`,
          contribuyente: sql`excluded.contribuyente`,
          direccion: sql`excluded.direccion`,
          updated_at: new Date(),
        },
      })
      .returning();

    res.json(result);
  } catch (error) {
    logger.error("Update settings error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al actualizar configuración" });
  }
}
