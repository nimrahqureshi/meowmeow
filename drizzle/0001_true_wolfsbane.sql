CREATE TABLE "affiliate_networks" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"tracking_param" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_networks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "merchants" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"logo" text,
	"website" text,
	"network_id" integer,
	"country" varchar(2) DEFAULT 'US',
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "merchants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "price_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"session_id" text,
	"email" text,
	"product_id" integer NOT NULL,
	"target_price" real NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"notified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"merchant_id" integer NOT NULL,
	"external_product_id" text,
	"merchant_url" text,
	"affiliate_url" text NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"price" real NOT NULL,
	"compare_at_price" real,
	"availability" varchar(20) DEFAULT 'unknown' NOT NULL,
	"shipping_info" text,
	"condition" varchar(20) DEFAULT 'new' NOT NULL,
	"source" varchar(40) DEFAULT 'manual' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"last_checked_at" timestamp,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchant_id" integer,
	"source" varchar(40) NOT NULL,
	"status" varchar(20) NOT NULL,
	"products_processed" integer DEFAULT 0 NOT NULL,
	"products_updated" integer DEFAULT 0 NOT NULL,
	"products_failed" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "rating" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "clicks" ADD COLUMN "offer_id" integer;--> statement-breakpoint
ALTER TABLE "clicks" ADD COLUMN "merchant_id" integer;--> statement-breakpoint
ALTER TABLE "clicks" ADD COLUMN "source_page" text;--> statement-breakpoint
ALTER TABLE "clicks" ADD COLUMN "placement" varchar(40);--> statement-breakpoint
ALTER TABLE "clicks" ADD COLUMN "device" varchar(20);--> statement-breakpoint
ALTER TABLE "clicks" ADD COLUMN "campaign" text;--> statement-breakpoint
ALTER TABLE "clicks" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "price_history" ADD COLUMN "offer_id" integer;--> statement-breakpoint
ALTER TABLE "price_history" ADD COLUMN "merchant_id" integer;--> statement-breakpoint
ALTER TABLE "price_history" ADD COLUMN "currency" varchar(3) DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "meta_title" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "meta_description" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "published" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "last_price_checked_at" timestamp;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_network_id_affiliate_networks_id_fk" FOREIGN KEY ("network_id") REFERENCES "public"."affiliate_networks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_offers" ADD CONSTRAINT "product_offers_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_offers" ADD CONSTRAINT "product_offers_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "merchants_network_idx" ON "merchants" USING btree ("network_id");--> statement-breakpoint
CREATE INDEX "price_alerts_product_idx" ON "price_alerts" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "price_alerts_user_idx" ON "price_alerts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "price_alerts_active_idx" ON "price_alerts" USING btree ("active");--> statement-breakpoint
CREATE INDEX "offers_product_idx" ON "product_offers" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "offers_merchant_idx" ON "product_offers" USING btree ("merchant_id");--> statement-breakpoint
CREATE INDEX "offers_price_idx" ON "product_offers" USING btree ("price");--> statement-breakpoint
CREATE INDEX "sync_logs_merchant_idx" ON "sync_logs" USING btree ("merchant_id");--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_offer_id_product_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."product_offers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_offer_id_product_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."product_offers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clicks_offer_idx" ON "clicks" USING btree ("offer_id");--> statement-breakpoint
CREATE INDEX "clicks_merchant_idx" ON "clicks" USING btree ("merchant_id");--> statement-breakpoint
CREATE INDEX "price_history_offer_idx" ON "price_history" USING btree ("offer_id");--> statement-breakpoint
CREATE INDEX "products_published_idx" ON "products" USING btree ("published");