CREATE TYPE "public"."user_estado" AS ENUM('activo', 'bloqueado');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "estado" "user_estado" DEFAULT 'activo' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ultima_actividad" timestamp;