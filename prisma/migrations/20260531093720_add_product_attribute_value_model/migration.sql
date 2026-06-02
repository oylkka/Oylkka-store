-- AlterTable
ALTER TABLE "product_attribute_option" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isVariantDefining" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "product_attribute_value" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "product_attribute_value_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_attribute_value_optionId_idx" ON "product_attribute_value"("optionId");

-- CreateIndex
CREATE UNIQUE INDEX "product_attribute_value_optionId_slug_key" ON "product_attribute_value"("optionId", "slug");

-- AddForeignKey
ALTER TABLE "product_attribute_value" ADD CONSTRAINT "product_attribute_value_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "product_attribute_option"("id") ON DELETE CASCADE ON UPDATE CASCADE;
