CREATE INDEX "users_documento_deleted_at_idx" ON "users" ("documento", "deleted_at");--> statement-breakpoint
CREATE INDEX "users_deleted_at_idx" ON "users" ("deleted_at");--> statement-breakpoint
CREATE INDEX "incidents_deleted_at_idx" ON "incidents" ("deleted_at");