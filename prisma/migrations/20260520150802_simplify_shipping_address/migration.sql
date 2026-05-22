/*
  Warnings:

  - You are about to drop the column `shippingAddressLine1` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddressLine2` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingCity` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingCountry` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingState` on the `order` table. All the data in the column will be lost.
  - Added the required column `shippingAddress` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingDistrict` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingUpzila` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order" DROP COLUMN "shippingAddressLine1",
DROP COLUMN "shippingAddressLine2",
DROP COLUMN "shippingCity",
DROP COLUMN "shippingCountry",
DROP COLUMN "shippingState",
ADD COLUMN     "shippingAddress" TEXT NOT NULL,
ADD COLUMN     "shippingComment" TEXT,
ADD COLUMN     "shippingDistrict" TEXT NOT NULL,
ADD COLUMN     "shippingUpzila" TEXT NOT NULL,
ALTER COLUMN "shippingPostalCode" DROP NOT NULL;
