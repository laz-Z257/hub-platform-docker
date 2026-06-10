import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { env } from "../config/env";
import "dotenv/config";

async function runMigrations() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
    connectionTimeoutMillis: 10000,
    query_timeout: 15000,
  });

  const db = drizzle(pool);

  console.log("Running migrations...");
  try {
    await Promise.race([
      migrate(db, { migrationsFolder: "./drizzle" }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Migration timeout after 30s")), 30000)
      ),
    ]);
    console.log("Migrations completed.");
  } catch (err) {
    console.error("Migration warning:", (err as Error).message);
    console.log("Continuing anyway...");
  }

  await pool.end().catch(() => {});
  console.log("Migrate script done.");
}

runMigrations().catch((err) => {
  console.error("Migration warning:", err instanceof Error ? err.message : err);
});
