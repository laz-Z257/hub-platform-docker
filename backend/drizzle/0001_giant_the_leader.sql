DO $$ BEGIN
  CREATE TYPE "public"."user_estado" AS ENUM('activo', 'bloqueado');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "estado" "user_estado" DEFAULT 'activo' NOT NULL;
EXCEPTION WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ultima_actividad" timestamp;
EXCEPTION WHEN duplicate_column THEN null;
END $$;
