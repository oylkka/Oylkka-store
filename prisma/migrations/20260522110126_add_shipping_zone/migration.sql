-- CreateTable
CREATE TABLE "shipping_zone" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "districts" TEXT[],
    "baseCost" DOUBLE PRECISION NOT NULL,
    "perItem" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "freeAbove" DOUBLE PRECISION,
    "estDays" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_zone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shipping_zone_shopId_idx" ON "shipping_zone"("shopId");

-- AddForeignKey
ALTER TABLE "shipping_zone" ADD CONSTRAINT "shipping_zone_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
