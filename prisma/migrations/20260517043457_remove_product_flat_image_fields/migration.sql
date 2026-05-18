/*
  Warnings:

  - You are about to drop the column `imagePublicId` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product" DROP COLUMN "imagePublicId",
DROP COLUMN "imageUrl";
