CREATE TYPE "public"."import_claim_status" AS ENUM('pending', 'verified', 'imported');--> statement-breakpoint
CREATE TABLE "listing_import_claims" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "listing_import_claims_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"source" text NOT NULL,
	"source_listing_id" text NOT NULL,
	"source_url" text NOT NULL,
	"verification_code" text NOT NULL,
	"status" "import_claim_status" DEFAULT 'pending' NOT NULL,
	"draft" jsonb,
	"verified_at" timestamp with time zone,
	"consented_at" timestamp with time zone,
	"consent_text_version" text,
	"imported_listing_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "listing_import_claims" ADD CONSTRAINT "listing_import_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_import_claims" ADD CONSTRAINT "listing_import_claims_imported_listing_id_listings_id_fk" FOREIGN KEY ("imported_listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listing_import_claims_user_id_created_at_index" ON "listing_import_claims" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "listing_import_claims_imported_source_unique" ON "listing_import_claims" USING btree ("source","source_listing_id") WHERE "listing_import_claims"."status" = 'imported';