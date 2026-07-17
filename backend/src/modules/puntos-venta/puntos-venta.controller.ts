import { Request, Response } from "express";
import { ilike, eq } from "drizzle-orm";
import { db } from "../../db";
import { puntosVenta } from "../../db/schema";
import { logger } from "../../lib/logger";

const PV_SEED_NAMES = [
  "PUNTO 01", "P44 BILLAR 4 CON 4", "PUNTO 86", "PUNTO 04",
  "PUNTO 05", "P19 REGISTRADURIA", "P84 3RA CON 3RA - OFICINA PRI",
  "P30 MADRIGAL", "P66 LLERRAS", "P28 LLERAS QUENEDY", "P85 SARATANA",
  "P32 GAITAN", "P26 GUACANDA 1", "P09 BOLIVAR", "P25 11 CON 3",
  "PUNTO 10", "P40 URIBE SPB", "P50 15 CON 3", "P33 PARQUE BOLIVAR",
  "P22 BAUTISTA", "P27 URIBE2", "P60 CARMELINA", "P72 ESTANCIA",
  "P57 LA ESTANCIA", "P37 EL PUERTO", "P18 COUNTRY MALL GUABINAS",
  "P31 CL 15 37 71 SAMECO", "P65 SAN JORGE2", "P23 PIZARRO",
  "P42 RIGO PAN", "P45 INTERIOR GALERIA", "P47 4 CON 9",
  "P52 AFUERA GALERIA", "PUNTO 81", "P53 FRAY PEÑA",
  "TAT PANORAMA ", "TIENDA TAT SANFERNANDO", "TAT - GUADALUPE",
  "TIENDA TAT PUERTO P71", "P17 PPAL AMERICAS", "PUNTO 94",
  "P90 GUABINAS", "P20 CENCAR LOCAL", "PUNTO 73", "PUNTO 83",
  "P54 PTO ARROYOHONDO", "PUNTO 75 PRIMAX", "P51 CONTROL YUMBEÑOS",
  "P55 DAPA MIRAVALLE", "TAT DAPA EL HUECO", "P48 FIJO MULALO",
  "P14 SAN MARCOS", "P96 PATIO BONITO VIJES", "PUNTO 11",
  "P58 VIJES 2", "SERVICENTRO EL SAMAN", "PUNTO 46 VIJES",
  "LOMITAS TAT", "TAT ROSEMBERG ALBAN", "P93 CUMBRE 3",
  "PUNTO 15", "PUNTO 16", "TIENDA TAT PAVAS P24",
  "P13 CUMBRE NUEVO", "P82-CUMBRE", "P70 - LA CUMBRE -TAT",
  "P99 - LA CUMBRE TAT", "P87 NUEVA ESTANCIA",
];

export async function seedPuntosVenta(
  req: Request,
  res: Response
): Promise<void> {
  try {
    let created = 0;
    for (const nombre of PV_SEED_NAMES) {
      const [existing] = await db
        .select({ id: puntosVenta.id })
        .from(puntosVenta)
        .where(eq(puntosVenta.nombre, nombre))
        .limit(1);

      if (!existing) {
        await db.insert(puntosVenta).values({ nombre });
        created++;
      }
    }

    logger.info(`Seed PV: ${created} created, ${PV_SEED_NAMES.length - created} already existed`);
    res.json({ ok: true, created, total: PV_SEED_NAMES.length });
  } catch (error) {
    logger.error("Seed PV error", { error: (error as Error).message });
    res.status(500).json({ error: (error as Error).message });
  }
}

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
      .orderBy(puntosVenta.nombre)
      .limit(100);

    res.json(items);
  } catch (error) {
    logger.error("List puntos venta error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al listar puntos de venta" });
  }
}
