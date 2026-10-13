-- DropForeignKey
ALTER TABLE "global_attribute_value" DROP CONSTRAINT IF EXISTS "global_attribute_value_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "product_global_attribute_value" DROP CONSTRAINT IF EXISTS "product_global_attribute_value_productId_fkey";

-- DropForeignKey
ALTER TABLE "product_global_attribute_value" DROP CONSTRAINT IF EXISTS "product_global_attribute_value_globalAttributeId_fkey";

-- DropForeignKey
ALTER TABLE "product_global_attribute_value" DROP CONSTRAINT IF EXISTS "product_global_attribute_value_globalValueId_fkey";

-- DropTable
DROP TABLE IF EXISTS "product_global_attribute_value";

-- DropTable
DROP TABLE IF EXISTS "global_attribute_value";

-- DropTable
DROP TABLE IF EXISTS "global_attribute";
