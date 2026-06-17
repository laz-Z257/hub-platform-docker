ALTER TABLE "users" ADD COLUMN "bloqueado_por" uuid;-->statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_bloqueado_por_users_id_fk" FOREIGN KEY ("bloqueado_por") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
