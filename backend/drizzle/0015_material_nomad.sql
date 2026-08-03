-- Limpieza de seguridad: anular referencias huérfanas antes de crear la FK.
-- Si algún "bloqueado_por" apunta a un usuario que ya no existe, lo ponemos en NULL
-- para que el ALTER TABLE ADD CONSTRAINT no falle.
UPDATE "users"
SET "bloqueado_por" = NULL
WHERE "bloqueado_por" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "users" AS "blocker"
    WHERE "blocker"."id" = "users"."bloqueado_por"
  );--> statement-breakpoint

ALTER TABLE "users" ADD CONSTRAINT "users_bloqueado_por_users_id_fk" FOREIGN KEY ("bloqueado_por") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
