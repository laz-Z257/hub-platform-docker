CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"puntuacion" integer NOT NULL,
	"comentario" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ratings_incident_id_unique" UNIQUE("incident_id")
);
--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_incident_id_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ratings_incident_id_idx" ON "ratings" USING btree ("incident_id");--> statement-breakpoint
CREATE INDEX "ratings_user_id_idx" ON "ratings" USING btree ("user_id");
