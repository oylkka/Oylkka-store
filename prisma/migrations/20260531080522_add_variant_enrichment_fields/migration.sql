-- CreateEnum
CREATE TYPE "VariantStatus" AS ENUM ('ACTIVE', 'DISABLED', 'PRE_ORDER', 'OUT_OF_STOCK', 'DISCONTINUED');

-- AlterTable
ALTER TABLE "product_variant" ADD COLUMN     "availableAt" TIMESTAMP(3),
ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "dimensionHeight" DOUBLE PRECISION,
ADD COLUMN     "dimensionLength" DOUBLE PRECISION,
ADD COLUMN     "dimensionUnit" TEXT NOT NULL DEFAULT 'cm',
ADD COLUMN     "dimensionWidth" DOUBLE PRECISION,
ADD COLUMN     "freeShipping" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lowStockAlert" INTEGER,
ADD COLUMN     "reservedStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "status" "VariantStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "weight" DOUBLE PRECISION,
ADD COLUMN     "weightUnit" TEXT NOT NULL DEFAULT 'kg';
