import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../config/env";
import { logger } from "../lib/logger";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DB_SSL ? { rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED } : false,
  max: 10,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  allowExitOnIdle: true,
});

pool.on("error", (err) => {
  logger.error("PostgreSQL pool error", { error: err.message });
});

export const db = drizzle({ client: pool });
