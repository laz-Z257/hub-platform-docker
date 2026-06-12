import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "./schema";
import { env } from "../config/env";
import "dotenv/config";

async function seed() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
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
    { documento: "123456789", nombre: "Admin Principal", email: "admin@hub.ai", rol: "admin" as const },
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

  await pool.end().catch(() => {});
  console.log("Seed completed.");
}

seed().catch((err) => {
  console.error("Seed warning:", err instanceof Error ? err.message : err);
});
