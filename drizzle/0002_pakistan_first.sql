-- Pakistan-first defaults: currency PKR, merchant country PK
ALTER TABLE "merchants" ALTER COLUMN "country" SET DEFAULT 'PK';
ALTER TABLE "merchants" ALTER COLUMN "currency" SET DEFAULT 'PKR';
ALTER TABLE "product_offers" ALTER COLUMN "currency" SET DEFAULT 'PKR';
ALTER TABLE "price_history" ALTER COLUMN "currency" SET DEFAULT 'PKR';
ALTER TABLE "price_alerts" ALTER COLUMN "currency" SET DEFAULT 'PKR';
