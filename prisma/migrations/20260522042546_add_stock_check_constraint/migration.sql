-- Fix any negative stock values before adding constraint
UPDATE "product" SET stock = 0 WHERE stock < 0;
UPDATE "product_variant" SET stock = 0 WHERE stock < 0;

-- Add CHECK constraints to prevent negative stock at the database level
ALTER TABLE "product" ADD CONSTRAINT "product_stock_non_negative" CHECK (stock >= 0);
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_stock_non_negative" CHECK (stock >= 0);
