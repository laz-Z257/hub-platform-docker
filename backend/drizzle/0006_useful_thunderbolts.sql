ALTER TABLE "incidents" ADD COLUMN "cerrado_por" uuid;--> statement-breakpoint
ALTER TABLE "incidents" ADD COLUMN "fecha_cierre" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "incidents" ADD CONSTRAINT "incidents_cerrado_por_users_id_fk" FOREIGN KEY ("cerrado_por") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
