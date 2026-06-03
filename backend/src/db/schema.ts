import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

export const rolEnum = pgEnum("rol", ["user", "admin"]);
export const urgenciaEnum = pgEnum("urgencia", ["baja", "media", "alta"]);
export const estadoEnum = pgEnum("estado", [
  "pendiente",
  "en_proceso",
  "resuelto",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  documento: varchar("documento", { length: 20 }).notNull().unique(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  contrasena: varchar("contrasena", { length: 255 }).notNull(),
  rol: rolEnum("rol").notNull().default("user"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const incidents = pgTable("incidents", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  documento: varchar("documento", { length: 20 }).notNull(),
  punto_venta: varchar("punto_venta", { length: 150 }).notNull(),
  telefono: varchar("telefono", { length: 20 }).notNull().default(""),
  descripcion: text("descripcion").notNull(),
  urgencia: urgenciaEnum("urgencia").notNull().default("media"),
  estado: estadoEnum("estado").notNull().default("pendiente"),
  agente: varchar("agente", { length: 100 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  is_bot: boolean("is_bot").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const incidentComments = pgTable("incident_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  incident_id: uuid("incident_id")
    .references(() => incidents.id, { onDelete: "cascade" })
    .notNull(),
  autor: varchar("autor", { length: 100 }).notNull(),
  texto: text("texto").notNull(),
  fecha: timestamp("fecha").defaultNow().notNull(),
});
