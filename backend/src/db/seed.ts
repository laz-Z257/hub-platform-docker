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
  });
  const db = drizzle(pool);

  console.log("Seeding database...");

  const seedPassword =
    process.env.SEED_ADMIN_PASSWORD ||
    crypto.randomBytes(16).toString("hex");

  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  SEED ADMIN PASSWORD:", seedPassword);
    console.log("  Guarda esta contraseña. No se volverá a mostrar.");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }

  const password = await bcrypt.hash(seedPassword, 10);

  const seedUsers = [
    { documento: "123456789", nombre: "Admin Principal", email: "admin@hub.ai", rol: "admin" as const },
  ];

  for (const u of seedUsers) {
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
    }
  }

  await pool.end();
  console.log("Seed completed.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
