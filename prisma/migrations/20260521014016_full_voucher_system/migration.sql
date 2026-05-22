-- CreateEnum
CREATE TYPE "PlatformRestriction" AS ENUM ('ALL', 'MOBILE_ONLY', 'WEB_ONLY');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CouponScope" ADD VALUE 'GLOBAL';
ALTER TYPE "CouponScope" ADD VALUE 'USER';

-- AlterEnum
ALTER TYPE "DiscountType" ADD VALUE 'CASHBACK';

-- AlterTable
ALTER TABLE "coupon" ADD COLUMN     "autoApply" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bogoBuyQty" INTEGER,
ADD COLUMN     "bogoFreeQty" INTEGER,
ADD COLUMN     "claimedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "firstOrderOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "freeShipping" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxClaimCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxDiscount" DOUBLE PRECISION,
ADD COLUMN     "minQuantity" INTEGER,
ADD COLUMN     "platformRestriction" TEXT NOT NULL DEFAULT 'ALL',
ADD COLUMN     "repeatPurchaseOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requiredPaymentMethod" TEXT,
ADD COLUMN     "shippingDiscount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "shop" ADD COLUMN     "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "coupon_tier" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "type" "DiscountType",

    CONSTRAINT "coupon_tier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_voucher" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "orderId" TEXT,

    CONSTRAINT "user_voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "orderId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coupon_tier_couponId_idx" ON "coupon_tier"("couponId");

-- CreateIndex
CREATE INDEX "user_voucher_userId_idx" ON "user_voucher"("userId");

-- CreateIndex
CREATE INDEX "user_voucher_couponId_idx" ON "user_voucher"("couponId");

-- CreateIndex
CREATE UNIQUE INDEX "user_voucher_userId_couponId_key" ON "user_voucher"("userId", "couponId");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_userId_key" ON "wallet"("userId");

-- CreateIndex
CREATE INDEX "wallet_transaction_walletId_idx" ON "wallet_transaction"("walletId");

-- CreateIndex
CREATE INDEX "wallet_transaction_orderId_idx" ON "wallet_transaction"("orderId");

-- AddForeignKey
ALTER TABLE "coupon_tier" ADD CONSTRAINT "coupon_tier_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_voucher" ADD CONSTRAINT "user_voucher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_voucher" ADD CONSTRAINT "user_voucher_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transaction" ADD CONSTRAINT "wallet_transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
