-- AlterTable: Convert all money fields from DOUBLE PRECISION to NUMERIC(10,2)
-- Product
ALTER TABLE "product" ALTER COLUMN "price" TYPE NUMERIC(10, 2) USING "price"::NUMERIC(10, 2);
ALTER TABLE "product" ALTER COLUMN "discountPrice" TYPE NUMERIC(10, 2) USING "discountPrice"::NUMERIC(10, 2);

-- ProductVariant
ALTER TABLE "product_variant" ALTER COLUMN "price" TYPE NUMERIC(10, 2) USING "price"::NUMERIC(10, 2);
ALTER TABLE "product_variant" ALTER COLUMN "discountPrice" TYPE NUMERIC(10, 2) USING "discountPrice"::NUMERIC(10, 2);

-- CartItem
ALTER TABLE "cart_item" ALTER COLUMN "savedPrice" TYPE NUMERIC(10, 2) USING "savedPrice"::NUMERIC(10, 2);

-- Order
ALTER TABLE "order" ALTER COLUMN "subtotal" TYPE NUMERIC(10, 2) USING "subtotal"::NUMERIC(10, 2);
ALTER TABLE "order" ALTER COLUMN "discountAmount" TYPE NUMERIC(10, 2) USING "discountAmount"::NUMERIC(10, 2);
ALTER TABLE "order" ALTER COLUMN "shippingCost" TYPE NUMERIC(10, 2) USING "shippingCost"::NUMERIC(10, 2);
ALTER TABLE "order" ALTER COLUMN "tax" TYPE NUMERIC(10, 2) USING "tax"::NUMERIC(10, 2);
ALTER TABLE "order" ALTER COLUMN "total" TYPE NUMERIC(10, 2) USING "total"::NUMERIC(10, 2);
ALTER TABLE "order" ALTER COLUMN "couponDiscount" TYPE NUMERIC(10, 2) USING "couponDiscount"::NUMERIC(10, 2);
ALTER TABLE "order" ALTER COLUMN "refundAmount" TYPE NUMERIC(10, 2) USING "refundAmount"::NUMERIC(10, 2);

-- OrderItem
ALTER TABLE "order_item" ALTER COLUMN "unitPrice" TYPE NUMERIC(10, 2) USING "unitPrice"::NUMERIC(10, 2);
ALTER TABLE "order_item" ALTER COLUMN "discountPrice" TYPE NUMERIC(10, 2) USING "discountPrice"::NUMERIC(10, 2);
ALTER TABLE "order_item" ALTER COLUMN "total" TYPE NUMERIC(10, 2) USING "total"::NUMERIC(10, 2);
ALTER TABLE "order_item" ALTER COLUMN "commissionRate" TYPE NUMERIC(5, 2) USING "commissionRate"::NUMERIC(5, 2);
ALTER TABLE "order_item" ALTER COLUMN "commissionAmount" TYPE NUMERIC(10, 2) USING "commissionAmount"::NUMERIC(10, 2);
ALTER TABLE "order_item" ALTER COLUMN "vendorAmount" TYPE NUMERIC(10, 2) USING "vendorAmount"::NUMERIC(10, 2);

-- Coupon
ALTER TABLE "coupon" ALTER COLUMN "value" TYPE NUMERIC(10, 2) USING "value"::NUMERIC(10, 2);
ALTER TABLE "coupon" ALTER COLUMN "minOrderAmount" TYPE NUMERIC(10, 2) USING "minOrderAmount"::NUMERIC(10, 2);
ALTER TABLE "coupon" ALTER COLUMN "maxDiscount" TYPE NUMERIC(10, 2) USING "maxDiscount"::NUMERIC(10, 2);
ALTER TABLE "coupon" ALTER COLUMN "shippingDiscount" TYPE NUMERIC(10, 2) USING "shippingDiscount"::NUMERIC(10, 2);

-- CouponTier
ALTER TABLE "coupon_tier" ALTER COLUMN "value" TYPE NUMERIC(10, 2) USING "value"::NUMERIC(10, 2);

-- Wallet
ALTER TABLE "wallet" ALTER COLUMN "balance" TYPE NUMERIC(10, 2) USING "balance"::NUMERIC(10, 2);

-- WalletTransaction
ALTER TABLE "wallet_transaction" ALTER COLUMN "amount" TYPE NUMERIC(10, 2) USING "amount"::NUMERIC(10, 2);

-- Shop
ALTER TABLE "shop" ALTER COLUMN "commissionRate" TYPE NUMERIC(5, 2) USING "commissionRate"::NUMERIC(5, 2);
ALTER TABLE "shop" ALTER COLUMN "shippingCost" TYPE NUMERIC(10, 2) USING "shippingCost"::NUMERIC(10, 2);

-- Payout
ALTER TABLE "payout" ALTER COLUMN "amount" TYPE NUMERIC(10, 2) USING "amount"::NUMERIC(10, 2);

-- PayoutItem
ALTER TABLE "payout_item" ALTER COLUMN "amount" TYPE NUMERIC(10, 2) USING "amount"::NUMERIC(10, 2);
ALTER TABLE "payout_item" ALTER COLUMN "commission" TYPE NUMERIC(10, 2) USING "commission"::NUMERIC(10, 2);

-- ReturnRequest
ALTER TABLE "return_request" ALTER COLUMN "refundAmount" TYPE NUMERIC(10, 2) USING "refundAmount"::NUMERIC(10, 2);

-- ShippingZone
ALTER TABLE "shipping_zone" ALTER COLUMN "baseCost" TYPE NUMERIC(10, 2) USING "baseCost"::NUMERIC(10, 2);
ALTER TABLE "shipping_zone" ALTER COLUMN "perItem" TYPE NUMERIC(10, 2) USING "perItem"::NUMERIC(10, 2);
ALTER TABLE "shipping_zone" ALTER COLUMN "freeAbove" TYPE NUMERIC(10, 2) USING "freeAbove"::NUMERIC(10, 2);

-- CreateIndex: Add missing indexes
CREATE INDEX IF NOT EXISTS "order_createdAt_idx" ON "order"("createdAt");
CREATE INDEX IF NOT EXISTS "order_paymentMethod_idx" ON "order"("paymentMethod");

-- CreateUniqueConstraint: Prevent duplicate cart items
CREATE UNIQUE INDEX IF NOT EXISTS "cart_item_cartId_productId_variantId_key" ON "cart_item"("cartId", "productId", "variantId");
