CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."voucher_status" AS ENUM('available', 'used');--> statement-breakpoint
CREATE TABLE "phone_verification_codes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "phone_verification_codes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"phone" text NOT NULL,
	"code_hash" text NOT NULL,
	"failed_attempts" smallint DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_transaction_id" text,
	"voucher_count" smallint NOT NULL,
	"amount_czk" integer NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_providerTransactionId_unique" UNIQUE("provider_transaction_id")
);
--> statement-breakpoint
CREATE TABLE "topping_vouchers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "topping_vouchers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" text NOT NULL,
	"owner_user_id" text NOT NULL,
	"payment_id" integer,
	"status" "voucher_status" DEFAULT 'available' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_on_listing_id" integer,
	"used_by_user_id" text,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "topping_vouchers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
DROP INDEX "listings_category_id_status_published_at_index";--> statement-breakpoint
DROP INDEX "listings_status_published_at_index";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "top_count" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "sort_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
-- Existující inzeráty zatím nejsou topované: řadí se podle času vložení.
UPDATE "listings" SET "sort_at" = "published_at";--> statement-breakpoint
ALTER TABLE "phone_verification_codes" ADD CONSTRAINT "phone_verification_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topping_vouchers" ADD CONSTRAINT "topping_vouchers_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topping_vouchers" ADD CONSTRAINT "topping_vouchers_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topping_vouchers" ADD CONSTRAINT "topping_vouchers_used_on_listing_id_listings_id_fk" FOREIGN KEY ("used_on_listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topping_vouchers" ADD CONSTRAINT "topping_vouchers_used_by_user_id_users_id_fk" FOREIGN KEY ("used_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "phone_verification_codes_user_id_created_at_index" ON "phone_verification_codes" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "payments_user_id_created_at_index" ON "payments" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "topping_vouchers_owner_user_id_status_expires_at_index" ON "topping_vouchers" USING btree ("owner_user_id","status","expires_at");--> statement-breakpoint
CREATE INDEX "listings_category_id_status_sort_at_index" ON "listings" USING btree ("category_id","status","sort_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "listings_status_sort_at_index" ON "listings" USING btree ("status","sort_at" DESC NULLS LAST);