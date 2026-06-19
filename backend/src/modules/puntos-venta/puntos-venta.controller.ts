import { Request, Response } from "express";
import { ilike } from "drizzle-orm";
import { db } from "../../db";
import { puntosVenta } from "../../db/schema";

export async function listPuntosVenta(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const search = req.query.search as string | undefined;

    const items = await db
      .select()
      .from(puntosVenta)
      .where(search ? ilike(puntosVenta.nombre, `%${search}%`) : undefined)
      .orderBy(puntosVenta.nombre);

    res.json(items);
  } catch (error) {
    console.error("List puntos venta error:", error);
    res.status(500).json({ error: "Error al listar puntos de venta" });
  }
}
