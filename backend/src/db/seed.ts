import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, puntosVenta } from "./schema";
import { env } from "../config/env";
import "dotenv/config";

async function seed() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
    query_timeout: 15000,
  });
  const db = drizzle(pool);

  console.log("Seeding database...");

  const seedPassword =
    process.env.SEED_ADMIN_PASSWORD ||
    crypto.randomBytes(16).toString("hex");

  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log("  SEED ADMIN PASSWORD generada automáticamente.");
    console.log("  Define SEED_ADMIN_PASSWORD para controlarla.");
  }

  const password = await bcrypt.hash(seedPassword, 10);

  const seedUsers = [
    { documento: "123456789", nombre: "Admin Principal", email: `admin@${env.EMAIL_DOMAIN}`, rol: "admin" as const },
  ];

  for (const u of seedUsers) {
    try {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.documento, u.documento))
        .limit(1);

    if (!existing) {
      await db
        .insert(users)
        .values({ ...u, contrasena: password });
      console.log(`  User created: ${u.nombre} (${u.documento})`);
    } else {
      console.log(`  User exists: ${u.nombre}`);
      if (process.env.SEED_ADMIN_PASSWORD) {
        await db
          .update(users)
          .set({ contrasena: password, estado: "activo", intentos_fallidos: 0 })
          .where(eq(users.documento, u.documento));
        console.log(`  Password updated for: ${u.nombre}`);
      }
    }
    } catch (err) {
      console.error(`  Seed warning for ${u.documento}:`, (err as Error).message);
    }
  }

  // Seed puntos de venta
  const pvNames = [
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

  for (const nombre of pvNames) {
    try {
      const [existing] = await db
        .select({ id: puntosVenta.id })
        .from(puntosVenta)
        .where(eq(puntosVenta.nombre, nombre))
        .limit(1);

      if (!existing) {
        await db.insert(puntosVenta).values({ nombre });
        console.log(`  PV created: ${nombre}`);
      }
    } catch (err) {
      console.error(`  PV seed warning for ${nombre}:`, (err as Error).message);
    }
  }

  await pool.end().catch(() => {});
  console.log("Seed completed.");
}

seed().catch((err) => {
  console.error("Seed warning:", err instanceof Error ? err.message : err);
});
