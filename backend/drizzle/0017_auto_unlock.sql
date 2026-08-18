ALTER TABLE "users" ADD COLUMN "bloqueado_hasta" timestamp;--> statement-breakpoint
UPDATE "users" SET "bloqueado_hasta" = now() + interval '15 minutes' WHERE "estado" = 'bloqueado' AND "bloqueado_por" IS NULL AND "intentos_fallidos" >= 5;
