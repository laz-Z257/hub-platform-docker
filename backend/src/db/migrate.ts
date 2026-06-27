import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import "dotenv/config";

async function runMigrations() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
    query_timeout: 15000,
  });

  const db = drizzle(pool);

  logger.info("Running migrations...");
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    logger.info("Migrations completed.");
  } catch (err) {
    logger.warn("Migration warning", { error: (err as Error).message });
    logger.info("Continuing anyway...");
  }

  try {
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS failedAttempts integer DEFAULT 0 NOT NULL");
    logger.info("Column failedAttempts verified.");
  } catch (err) {
    logger.warn("Column migration warning", { error: (err as Error).message });
  }

  try {
    await pool.query("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS seenByAdmin boolean DEFAULT false NOT NULL");
    logger.info("Column seenByAdmin verified.");
  } catch (err) {
    logger.warn("Column migration warning", { error: (err as Error).message });
  }

  try {
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS blockedBy uuid");
    logger.info("Column blockedBy verified.");
  } catch (err) {
    logger.warn("Column migration warning", { error: (err as Error).message });
  }

  try {
    await pool.query("ALTER TYPE rol ADD VALUE IF NOT EXISTS 'tecnico'");
    logger.info("Role tecnico added.");
  } catch (err) {
    logger.warn("Role migration warning", { error: (err as Error).message });
  }

  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS puntos_venta (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nombre VARCHAR(150) NOT NULL UNIQUE,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`);
    logger.info("Table puntos_venta verified.");
  } catch (err) {
    logger.warn("PV table migration warning", { error: (err as Error).message });
  }

  await pool.end().catch(() => {});
  logger.info("Migrate script done.");
}

runMigrations().catch((err) => {
  logger.warn("Migration warning", { error: err instanceof Error ? err.message : err });
});
