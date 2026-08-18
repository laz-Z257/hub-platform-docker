import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, puntosVenta } from "./schema";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { PV_SEED_NAMES } from "./constants";
import "dotenv/config";

async function seed() {
  // En producción, solo sembrar si la BD está vacía o si RUN_SEED=true explícitamente
  // (evita correr el seed en cada deploy/restart de Render)
  if (process.env.NODE_ENV === "production" && process.env.RUN_SEED !== "true") {
    const pool0 = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.DB_SSL ? { rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED } : false,
      connectionTimeoutMillis: 10000,
      query_timeout: 15000,
    });
    try {
      const res = await pool0.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM users");
      if (Number(res.rows[0]?.count ?? "0") > 0) {
        logger.info("Seed skipped: la BD ya tiene usuarios (NODE_ENV=production, RUN_SEED!=true).");
        await pool0.end().catch(() => {});
        return;
      }
    } catch (err) {
      logger.warn("Seed pre-check failed, continuando con seed normal", {
        error: (err as Error).message,
      });
    } finally {
      await pool0.end().catch(() => {});
    }
  }

  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DB_SSL
      ? { rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED }
      : false,
    connectionTimeoutMillis: 10000,
    query_timeout: 15000,
  });
  const db = drizzle(pool);

  logger.info("Seeding database...");

  const seedPassword =
    process.env.SEED_ADMIN_PASSWORD ||
    crypto.randomBytes(16).toString("hex");

  if (!process.env.SEED_ADMIN_PASSWORD) {
    logger.info("Seed: SEED_ADMIN_PASSWORD no definida. Se usó password autogenerada (solo para desarrollo).");
  }

  const password = await bcrypt.hash(seedPassword, 12);

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
        logger.info(`User created: ${u.nombre} (${u.documento})`);
      } else {
        logger.info(`User exists: ${u.nombre} (password not modified)`);
      }
    } catch (err) {
      logger.warn(`Seed warning for ${u.documento}: ${(err as Error).message}`);
    }
  }

  // Seed puntos de venta
  for (const nombre of PV_SEED_NAMES) {
    try {
      const [existing] = await db
        .select({ id: puntosVenta.id })
        .from(puntosVenta)
        .where(eq(puntosVenta.nombre, nombre))
        .limit(1);

      if (!existing) {
        await db.insert(puntosVenta).values({ nombre });
        logger.info(`PV created: ${nombre}`);
      }
    } catch (err) {
      logger.warn(`PV seed warning for ${nombre}: ${(err as Error).message}`);
    }
  }

  await pool.end().catch(() => {});
  logger.info("Seed completed.");
}

seed().catch((err) => {
  logger.warn("Seed warning", { error: err instanceof Error ? err.message : err });
});
