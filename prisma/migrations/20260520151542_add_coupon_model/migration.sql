-- CreateTable
CREATE TABLE "coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "DiscountType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minOrderAmount" DOUBLE PRECISION,
    "scope" "CouponScope" NOT NULL,
    "scopeId" TEXT,
    "maxUses" INTEGER NOT NULL DEFAULT 0,
    "maxUsesPerUser" INTEGER NOT NULL DEFAULT 0,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_usage" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coupon_code_key" ON "coupon"("code");

-- CreateIndex
CREATE INDEX "coupon_code_idx" ON "coupon"("code");

-- CreateIndex
CREATE INDEX "coupon_isActive_idx" ON "coupon"("isActive");

-- CreateIndex
CREATE INDEX "coupon_usage_couponId_idx" ON "coupon_usage"("couponId");

-- CreateIndex
CREATE INDEX "coupon_usage_couponId_userId_idx" ON "coupon_usage"("couponId", "userId");

-- AddForeignKey
ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
