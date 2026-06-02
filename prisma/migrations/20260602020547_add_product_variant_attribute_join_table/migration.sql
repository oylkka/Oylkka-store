-- CreateTable
CREATE TABLE "product_variant_attribute" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "attributeValueId" TEXT NOT NULL,

    CONSTRAINT "product_variant_attribute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_variant_attribute_attributeValueId_idx" ON "product_variant_attribute"("attributeValueId");

-- CreateIndex
CREATE INDEX "product_variant_attribute_variantId_idx" ON "product_variant_attribute"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_attribute_variantId_attributeValueId_key" ON "product_variant_attribute"("variantId", "attributeValueId");

-- AddForeignKey
ALTER TABLE "product_variant_attribute" ADD CONSTRAINT "product_variant_attribute_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_attribute" ADD CONSTRAINT "product_variant_attribute_attributeValueId_fkey" FOREIGN KEY ("attributeValueId") REFERENCES "product_attribute_value"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
