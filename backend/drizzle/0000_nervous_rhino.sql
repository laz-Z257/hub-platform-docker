CREATE TYPE "public"."estado" AS ENUM('pendiente', 'en_proceso', 'resuelto');--> statement-breakpoint
CREATE TYPE "public"."rol" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."urgencia" AS ENUM('baja', 'media', 'alta');--> statement-breakpoint
CREATE TABLE "incident_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_id" uuid NOT NULL,
	"autor" varchar(100) NOT NULL,
	"texto" text NOT NULL,
	"fecha" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"documento" varchar(20) NOT NULL,
	"punto_venta" varchar(150) NOT NULL,
	"telefono" varchar(20) DEFAULT '' NOT NULL,
	"descripcion" text NOT NULL,
	"urgencia" "urgencia" DEFAULT 'media' NOT NULL,
	"estado" "estado" DEFAULT 'pendiente' NOT NULL,
	"agente" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"is_bot" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"documento" varchar(20) NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"email" varchar(150),
	"contrasena" varchar(255) NOT NULL,
	"rol" "rol" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_documento_unique" UNIQUE("documento")
);
--> statement-breakpoint
ALTER TABLE "incident_comments" ADD CONSTRAINT "incident_comments_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "incident_comments_incident_id_idx" ON "incident_comments" USING btree ("incident_id");--> statement-breakpoint
CREATE INDEX "incidents_user_id_idx" ON "incidents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "incidents_estado_idx" ON "incidents" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "incidents_urgencia_idx" ON "incidents" USING btree ("urgencia");--> statement-breakpoint
CREATE INDEX "incidents_created_at_idx" ON "incidents" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "messages_user_id_idx" ON "messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");