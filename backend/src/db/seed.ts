import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, incidents } from "./schema";
import { env } from "../config/env";
import "dotenv/config";

async function seed() {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const db = drizzle(pool);

  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.documento, "123456789"))
    .limit(1);

  let adminId: string;

  if (!existingAdmin) {
    const [admin] = await db
      .insert(users)
      .values({
        documento: "123456789",
        nombre: "Admin Principal",
        contrasena: adminPassword,
        rol: "admin",
      })
      .returning();
    adminId = admin.id;
    console.log("Admin user created.");
  } else {
    adminId = existingAdmin.id;
    console.log("Admin user already exists.");
  }

  // Create regular user
  const userPassword = await bcrypt.hash("user123", 10);
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.documento, "987654321"))
    .limit(1);

  let userId: string;

  if (!existingUser) {
    const [usr] = await db
      .insert(users)
      .values({
        documento: "987654321",
        nombre: "Usuario Demo",
        contrasena: userPassword,
        rol: "user",
      })
      .returning();
    userId = usr.id;
    console.log("Demo user created.");
  } else {
    userId = existingUser.id;
    console.log("Demo user already exists.");
  }

  // Seed incidents only if table is empty
  const incidentCount = await db.$count(incidents);

  if (incidentCount === 0) {
    const incidentData = [
      {
        user_id: userId,
        nombre: "Juan Pérez",
        documento: "12345678",
        punto_venta: "Centro Comercial Plaza",
        telefono: "3001234567",
        descripcion: "El terminal de pago no responde al pasar tarjetas.",
        urgencia: "alta" as const,
        estado: "pendiente" as const,
      },
      {
        user_id: userId,
        nombre: "María Gómez",
        documento: "87654321",
        punto_venta: "Aeropuerto Terminal 2",
        telefono: "3009876543",
        descripcion: "La impresora fiscal no emite comprobantes.",
        urgencia: "alta" as const,
        estado: "en_proceso" as const,
        agente: "Admin Principal",
      },
      {
        user_id: userId,
        nombre: "Luis Torres",
        documento: "45678912",
        punto_venta: "Sucursal Norte",
        telefono: "3104567890",
        descripcion: "El sistema de inventario muestra datos desactualizados.",
        urgencia: "media" as const,
        estado: "resuelto" as const,
        agente: "Admin Principal",
      },
      {
        user_id: userId,
        nombre: "Ana Martínez",
        documento: "78912345",
        punto_venta: "Centro Comercial Plaza",
        telefono: "3157891234",
        descripcion:
          "Pantalla del POS se congela al abrir ciertas opciones.",
        urgencia: "alta" as const,
        estado: "en_proceso" as const,
        agente: "Admin Principal",
      },
      {
        user_id: userId,
        nombre: "Pedro Sánchez",
        documento: "32165498",
        punto_venta: "Sucursal Sur",
        telefono: "3203216549",
        descripcion: "No se puede iniciar sesión en el sistema.",
        urgencia: "alta" as const,
        estado: "pendiente" as const,
      },
      {
        user_id: userId,
        nombre: "Carlos Ruiz",
        documento: "65498732",
        punto_venta: "Aeropuerto Terminal 1",
        telefono: "3006549873",
        descripcion: "Lecto de código de barras muy lento.",
        urgencia: "baja" as const,
        estado: "resuelto" as const,
        agente: "Admin Principal",
      },
      {
        user_id: userId,
        nombre: "Diana López",
        documento: "98732145",
        punto_venta: "Sucursal Norte",
        telefono: "3109873214",
        descripcion: "Problemas con la sincronización de turnos en nómina.",
        urgencia: "media" as const,
        estado: "en_proceso" as const,
        agente: "Admin Principal",
      },
      {
        user_id: userId,
        nombre: "Roberto Díaz",
        documento: "74185296",
        punto_venta: "Centro Comercial Plaza",
        telefono: "3157418529",
        descripcion:
          "Impresora de recibos no corta el papel correctamente.",
        urgencia: "media" as const,
        estado: "pendiente" as const,
      },
      {
        user_id: userId,
        nombre: "Sofía Vargas",
        documento: "85296374",
        punto_venta: "Sucursal Este",
        telefono: "3208529637",
        descripcion: "Conexión intermitente con el servidor principal.",
        urgencia: "alta" as const,
        estado: "resuelto" as const,
        agente: "Admin Principal",
      },
      {
        user_id: userId,
        nombre: "Miguel Ángel Ríos",
        documento: "96385274",
        punto_venta: "Aeropuerto Terminal 2",
        telefono: "3009638527",
        descripcion: "El datáfono marca error 404 al procesar pagos.",
        urgencia: "alta" as const,
        estado: "en_proceso" as const,
        agente: "Admin Principal",
      },
      {
        user_id: userId,
        nombre: "Laura Jiménez",
        documento: "14725836",
        punto_venta: "Sucursal Sur",
        telefono: "3151472583",
        descripcion: "Actualización del software no se completa.",
        urgencia: "baja" as const,
        estado: "pendiente" as const,
      },
      {
        user_id: userId,
        nombre: "Fernando Castillo",
        documento: "25836914",
        punto_venta: "Centro Comercial Plaza",
        telefono: "3102583691",
        descripcion: "Teclado numérico no registra algunas teclas.",
        urgencia: "media" as const,
        estado: "resuelto" as const,
        agente: "Admin Principal",
      },
      {
        user_id: userId,
        nombre: "Carmen Ortega",
        documento: "36914725",
        punto_venta: "Aeropuerto Terminal 1",
        telefono: "3203691472",
        descripcion: "Monitor secundario muestra líneas verticales.",
        urgencia: "baja" as const,
        estado: "resuelto" as const,
        agente: "Admin Principal",
      },
      {
        user_id: userId,
        nombre: "Jorge Méndez",
        documento: "15975346",
        punto_venta: "Sucursal Norte",
        telefono: "3001597534",
        descripcion: "Software de nómina genera cálculos incorrectos.",
        urgencia: "alta" as const,
        estado: "en_proceso" as const,
        agente: "Admin Principal",
      },
      {
        user_id: userId,
        nombre: "Patricia Herrera",
        documento: "75315948",
        punto_venta: "Sucursal Este",
        telefono: "3157531594",
        descripcion:
          "El sistema se reinicia aleatoriamente durante el día.",
        urgencia: "alta" as const,
        estado: "pendiente" as const,
      },
    ];

    await db.insert(incidents).values(incidentData);
    console.log(`${incidentData.length} incidents seeded.`);
  } else {
    console.log("Incidents already exist, skipping.");
  }

  await pool.end();
  console.log("Seed completed.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
