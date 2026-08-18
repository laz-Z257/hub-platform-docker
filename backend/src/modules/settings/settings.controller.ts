import { Request, Response } from "express";
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

    // Solo actualizar los campos presentes: un PUT parcial no debe borrar
    // los campos omitidos (comportamiento anterior: los dejaba en "")
    const [existing] = await db
      .select()
      .from(companySettings)
      .limit(1);

    const merged = {
      nombre: nombre ?? existing?.nombre ?? "",
      contribuyente: contribuyente ?? existing?.contribuyente ?? "",
      direccion: direccion ?? existing?.direccion ?? "",
    };

    const [result] = await db
      .insert(companySettings)
      .values({ key: "default", ...merged })
      .onConflictDoUpdate({
        target: companySettings.key,
        set: { ...merged, updated_at: new Date() },
      })
      .returning();

    res.json(result);
  } catch (error) {
    logger.error("Update settings error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al actualizar configuración" });
  }
}
