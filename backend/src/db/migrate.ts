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

  await pool.end().catch(() => {});
  logger.info("Migrate script done.");
}

runMigrations().catch((err) => {
  logger.warn("Migration warning", { error: err instanceof Error ? err.message : err });
});
