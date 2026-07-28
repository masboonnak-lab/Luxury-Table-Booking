CREATE TYPE "public"."table_shape" AS ENUM('round', 'rect');--> statement-breakpoint
CREATE TYPE "public"."event_kind" AS ENUM('concert', 'dj', 'festival', 'special');--> statement-breakpoint
CREATE TYPE "public"."order_kind" AS ENUM('table', 'ticket');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."slip_status" AS ENUM('pending_bank_check', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE "zones" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"min_spend_satang" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "venue_tables" (
	"id" text PRIMARY KEY NOT NULL,
	"zone_id" text NOT NULL,
	"shape" "table_shape" NOT NULL,
	"x" integer NOT NULL,
	"y" integer NOT NULL,
	"w" integer NOT NULL,
	"h" integer NOT NULL,
	"min_seats" integer NOT NULL,
	"max_seats" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" "event_kind" NOT NULL,
	"title" text NOT NULL,
	"artist_th" text NOT NULL,
	"artist_en" text NOT NULL,
	"date" date NOT NULL,
	"doors_at" text NOT NULL,
	"price_satang" integer NOT NULL,
	"capacity" integer NOT NULL,
	"base_sold" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"kind" "order_kind" NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"booker_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"occasion" text,
	"notes" text,
	"date" date NOT NULL,
	"slot" text NOT NULL,
	"hold_until" text NOT NULL,
	"table_id" text,
	"guests" integer,
	"event_id" text,
	"quantity" integer,
	"amount_satang" integer NOT NULL,
	"hold_expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	CONSTRAINT "orders_code_unique" UNIQUE("code"),
	CONSTRAINT "orders_kind_shape_ck" CHECK ((
        "orders"."kind" = 'table'
          AND "orders"."table_id" IS NOT NULL AND "orders"."guests" IS NOT NULL
          AND "orders"."event_id" IS NULL AND "orders"."quantity" IS NULL
      ) OR (
        "orders"."kind" = 'ticket'
          AND "orders"."event_id" IS NOT NULL AND "orders"."quantity" IS NOT NULL
          AND "orders"."table_id" IS NULL AND "orders"."guests" IS NULL
      )),
	CONSTRAINT "orders_amount_ck" CHECK ("orders"."amount_satang" >= 0)
);
--> statement-breakpoint
CREATE TABLE "slips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hash" text NOT NULL,
	"order_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"status" "slip_status" DEFAULT 'pending_bank_check' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "slips_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"password_hash" text NOT NULL,
	"pdpa_consent_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "venue_tables" ADD CONSTRAINT "venue_tables_zone_id_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_table_id_venue_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."venue_tables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slips" ADD CONSTRAINT "slips_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_phone_idx" ON "orders" USING btree ("phone","created_at");--> statement-breakpoint
CREATE INDEX "orders_table_slot_idx" ON "orders" USING btree ("table_id","date","slot");--> statement-breakpoint
CREATE INDEX "orders_event_idx" ON "orders" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");