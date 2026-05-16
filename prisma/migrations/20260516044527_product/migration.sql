/*
  Warnings:

  - The values [REFURBISHED] on the enum `ProductCondition` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACTIVE] on the enum `ProductStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProductCondition_new" AS ENUM ('NEW', 'USED', 'LIKE_NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'FOR_PARTS');
ALTER TABLE "product" ALTER COLUMN "condition" TYPE "ProductCondition_new" USING ("condition"::text::"ProductCondition_new");
ALTER TYPE "ProductCondition" RENAME TO "ProductCondition_old";
ALTER TYPE "ProductCondition_new" RENAME TO "ProductCondition";
DROP TYPE "public"."ProductCondition_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ProductStatus_new" AS ENUM ('DRAFT', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'OUT_OF_STOCK');
ALTER TABLE "public"."product" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "product" ALTER COLUMN "status" TYPE "ProductStatus_new" USING ("status"::text::"ProductStatus_new");
ALTER TYPE "ProductStatus" RENAME TO "ProductStatus_old";
ALTER TYPE "ProductStatus_new" RENAME TO "ProductStatus";
DROP TYPE "public"."ProductStatus_old";
ALTER TABLE "product" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;
