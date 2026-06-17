ALTER TABLE "incidents" ADD COLUMN "visto_por_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "incidents_visto_idx" ON "incidents" USING btree ("visto_por_admin");
