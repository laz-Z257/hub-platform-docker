CREATE TABLE "company_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" varchar(200) DEFAULT '' NOT NULL,
	"contribuyente" varchar(50) DEFAULT '' NOT NULL,
	"direccion" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
