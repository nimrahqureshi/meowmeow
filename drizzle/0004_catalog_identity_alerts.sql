ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sku" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "mpn" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "gtin" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "source" varchar(40) DEFAULT 'manual' NOT NULL;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "source_id" text;
CREATE INDEX IF NOT EXISTS "products_gtin_idx" ON "products" ("gtin");
CREATE INDEX IF NOT EXISTS "products_mpn_idx" ON "products" ("mpn");
CREATE UNIQUE INDEX IF NOT EXISTS "products_source_uidx" ON "products" ("source", "source_id");

ALTER TABLE "price_alerts" ADD COLUMN IF NOT EXISTS "alert_type" varchar(20) DEFAULT 'target_price' NOT NULL;
ALTER TABLE "price_alerts" ALTER COLUMN "target_price" DROP NOT NULL;
ALTER TABLE "price_alerts" ADD COLUMN IF NOT EXISTS "target_percent_drop" real;
ALTER TABLE "price_alerts" ADD COLUMN IF NOT EXISTS "last_known_price" real;
ALTER TABLE "price_alerts" ADD COLUMN IF NOT EXISTS "last_known_availability" varchar(20);
