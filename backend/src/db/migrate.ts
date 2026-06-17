import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { env } from "../config/env";
import "dotenv/config";

async function runMigrations() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
    query_timeout: 15000,
  });

  const db = drizzle(pool);

  console.log("Running migrations...");
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations completed.");
  } catch (err) {
    console.error("Migration warning:", (err as Error).message);
    console.log("Continuing anyway...");
  }

  try {
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS intentos_fallidos integer DEFAULT 0 NOT NULL");
    console.log("Column intentos_fallidos verified.");
  } catch (err) {
    console.error("Column migration warning:", (err as Error).message);
  }

  try {
    await pool.query("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS visto_por_admin boolean DEFAULT false NOT NULL");
    console.log("Column visto_por_admin verified.");
  } catch (err) {
    console.error("Column migration warning:", (err as Error).message);
  }

  await pool.end().catch(() => {});
  console.log("Migrate script done.");
}

runMigrations().catch((err) => {
  console.error("Migration warning:", err instanceof Error ? err.message : err);
});
