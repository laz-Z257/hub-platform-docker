import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const rolEnum = pgEnum("rol", ["user", "asesor", "admin"]);
export const userEstadoEnum = pgEnum("user_estado", ["activo", "bloqueado"]);
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
  email: varchar("email", { length: 150 }),
  contrasena: varchar("contrasena", { length: 255 }).notNull(),
  rol: rolEnum("rol").notNull().default("user"),
  estado: userEstadoEnum("estado").notNull().default("activo"),
  ultima_actividad: timestamp("ultima_actividad"),
  token_version: integer("token_version").notNull().default(0),
  intentos_fallidos: integer("intentos_fallidos").notNull().default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const incidents = pgTable(
  "incidents",
  {
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
    solucion: text("solucion"),
    imagen_url: varchar("imagen_url", { length: 500 }),
    cerrado_por: uuid("cerrado_por").references(() => users.id, { onDelete: "set null" }),
    fecha_cierre: timestamp("fecha_cierre"),
    visto_por_admin: boolean("visto_por_admin").notNull().default(false),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("incidents_user_id_idx").on(table.user_id),
    index("incidents_estado_idx").on(table.estado),
    index("incidents_urgencia_idx").on(table.urgencia),
    index("incidents_created_at_idx").on(table.created_at),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content").notNull(),
    is_bot: boolean("is_bot").notNull().default(false),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("messages_user_id_idx").on(table.user_id),
    index("messages_created_at_idx").on(table.created_at),
  ]
);

export const incidentComments = pgTable(
  "incident_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    incident_id: uuid("incident_id")
      .references(() => incidents.id, { onDelete: "cascade" })
      .notNull(),
    autor: varchar("autor", { length: 100 }).notNull(),
    texto: text("texto").notNull(),
    fecha: timestamp("fecha").defaultNow().notNull(),
  },
  (table) => [index("incident_comments_incident_id_idx").on(table.incident_id)]
);

export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    incident_id: uuid("incident_id")
      .references(() => incidents.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    user_id: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    puntuacion: integer("puntuacion").notNull(),
    comentario: text("comentario"),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("ratings_incident_id_idx").on(table.incident_id),
    index("ratings_user_id_idx").on(table.user_id),
  ]
);
