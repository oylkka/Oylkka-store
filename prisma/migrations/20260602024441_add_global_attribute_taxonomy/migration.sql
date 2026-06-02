-- CreateTable
CREATE TABLE "global_attribute" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "global_attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_attribute_value" (
    "id" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "global_attribute_value_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_global_attribute_value" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "globalAttributeId" TEXT NOT NULL,
    "localValueId" TEXT NOT NULL,
    "globalValueId" TEXT NOT NULL,

    CONSTRAINT "product_global_attribute_value_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "global_attribute_slug_key" ON "global_attribute"("slug");

-- CreateIndex
CREATE INDEX "global_attribute_value_attributeId_idx" ON "global_attribute_value"("attributeId");

-- CreateIndex
CREATE UNIQUE INDEX "global_attribute_value_attributeId_slug_key" ON "global_attribute_value"("attributeId", "slug");

-- CreateIndex
CREATE INDEX "product_global_attribute_value_globalAttributeId_idx" ON "product_global_attribute_value"("globalAttributeId");

-- CreateIndex
CREATE INDEX "product_global_attribute_value_globalValueId_idx" ON "product_global_attribute_value"("globalValueId");

-- CreateIndex
CREATE INDEX "product_global_attribute_value_productId_idx" ON "product_global_attribute_value"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_global_attribute_value_productId_globalAttributeId__key" ON "product_global_attribute_value"("productId", "globalAttributeId", "localValueId");

-- AddForeignKey
ALTER TABLE "global_attribute_value" ADD CONSTRAINT "global_attribute_value_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "global_attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_global_attribute_value" ADD CONSTRAINT "product_global_attribute_value_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_global_attribute_value" ADD CONSTRAINT "product_global_attribute_value_globalAttributeId_fkey" FOREIGN KEY ("globalAttributeId") REFERENCES "global_attribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_global_attribute_value" ADD CONSTRAINT "product_global_attribute_value_globalValueId_fkey" FOREIGN KEY ("globalValueId") REFERENCES "global_attribute_value"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
