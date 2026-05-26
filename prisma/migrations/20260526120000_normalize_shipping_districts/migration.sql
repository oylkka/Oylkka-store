-- Normalize ShippingZone.districts from PostgreSQL array to a normalized table

-- CreateTable
CREATE TABLE "shipping_zone_district" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "district" TEXT NOT NULL,

    CONSTRAINT "shipping_zone_district_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shipping_zone_district_zoneId_district_key" ON "shipping_zone_district"("zoneId", "district");
CREATE INDEX "shipping_zone_district_district_idx" ON "shipping_zone_district"("district");
CREATE INDEX "shipping_zone_district_zoneId_idx" ON "shipping_zone_district"("zoneId");

-- AddForeignKey
ALTER TABLE "shipping_zone_district" ADD CONSTRAINT "shipping_zone_district_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "shipping_zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropColumn: districts array is replaced by the normalized table
ALTER TABLE "shipping_zone" DROP COLUMN "districts";
