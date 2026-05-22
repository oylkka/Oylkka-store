/*
  Warnings:

  - Made the column `shippingPhone` on table `order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'NAGAD';
ALTER TYPE "PaymentMethod" ADD VALUE 'ROCKET';

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledBy" TEXT,
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "paidAt" TIMESTAMP(3),
ALTER COLUMN "shippingPhone" SET NOT NULL;
