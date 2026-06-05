import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, incidents } from "./schema";
import { env } from "../config/env";
import "dotenv/config";

async function seed() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });
  const db = drizzle(pool);

  console.log("Seeding database...");

  const password = await bcrypt.hash("user123", 10);

  const seedUsers = [
    { documento: "123456789", nombre: "Admin Principal", email: "admin@hub.ai", rol: "admin" as const },
  ];

  const createdUserIds: string[] = [];

  for (const u of seedUsers) {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.documento, u.documento))
      .limit(1);

    if (!existing) {
      const [created] = await db
        .insert(users)
        .values({ ...u, contrasena: password })
        .returning();
      createdUserIds.push(created.id);
      console.log(`  User created: ${u.nombre} (${u.documento})`);
    } else {
      createdUserIds.push(existing.id);
      console.log(`  User exists: ${u.nombre}`);
    }
  }

  const incidentCount = await db.$count(incidents);

  if (incidentCount === 0 && createdUserIds.length > 0) {
    const now = new Date();
    const incidentData: typeof incidents.$inferInsert[] = [];
    const urgencias = ["baja", "media", "alta"] as const;
    const estados = ["pendiente", "en_proceso", "resuelto"] as const;
    const adminUserId = createdUserIds[0];

    const nombres = ["Ana Martínez", "Ricardo López", "Carla Gómez", "Sergio V.", "Laura Pérez", "Diego Mendoza"];
    const descripciones = [
      "Error crítico en base de datos de producción",
      "Solicitud de acceso a módulo de nómina",
      "Actualización de hardware puesto 24",
      "Falla en pasarela de pagos API",
      "Problema con autenticación SSO",
      "Lentitud extrema en el módulo de reportes",
      "Impresora fiscal no emite comprobantes",
      "Sistema de inventario muestra datos desactualizados",
      "Pantalla del POS se congela al abrir menú",
      "No se puede iniciar sesión en el sistema",
      "Lecto de código de barras muy lento",
      "Problemas con sincronización de turnos",
      "Impresora de recibos no corta papel",
      "Conexión intermitente con servidor principal",
      "Datáfono marca error al procesar pagos",
      "Actualización de software no completa",
      "Teclado numérico no registra teclas",
      "Monitor secundario muestra líneas verticales",
      "Software de nómina genera cálculos incorrectos",
      "El sistema se reinicia aleatoriamente",
    ];
    const categorias = [
      "Sistema Central / Base de Datos",
      "Recursos Humanos / Accesos",
      "Hardware / Mantenimiento",
      "Fintech / Pagos",
      "Infraestructura / SSO",
      "Sistema / Reportes",
    ];

    for (let i = 0; i < 30; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 48);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(date.getHours() - Math.floor(hoursAgo / 2));

      const urgencia = urgencias[Math.floor(Math.random() * urgencias.length)];
      const estado = estados[Math.floor(Math.random() * estados.length)];
      const nombreIndex = Math.floor(Math.random() * nombres.length);

      incidentData.push({
        user_id: adminUserId,
        nombre: nombres[nombreIndex],
        documento: String(10000000 + i),
        punto_venta: categorias[i % categorias.length],
        telefono: `300${String(1000000 + i).slice(1)}`,
        descripcion: descripciones[i % descripciones.length],
        urgencia,
        estado,
        agente: estado !== "pendiente" ? "Admin Principal" : null,
        created_at: date,
        updated_at: date,
      });
    }

    await db.insert(incidents).values(incidentData);
    console.log(`  ${incidentData.length} incidents seeded.`);
  } else {
    console.log(`  Incidents already exist (${incidentCount}), skipping.`);
  }

  await pool.end();
  console.log("Seed completed.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
