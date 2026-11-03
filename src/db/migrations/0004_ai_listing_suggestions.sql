CREATE TYPE "public"."ai_suggestion_status" AS ENUM('succeeded', 'not_sellable', 'refused', 'failed');--> statement-breakpoint
CREATE TABLE "ai_listing_suggestions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ai_listing_suggestions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"model" text NOT NULL,
	"status" "ai_suggestion_status" NOT NULL,
	"photo_count" smallint NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"cache_read_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_listing_suggestions" ADD CONSTRAINT "ai_listing_suggestions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_listing_suggestions_user_id_created_at_index" ON "ai_listing_suggestions" USING btree ("user_id","created_at");