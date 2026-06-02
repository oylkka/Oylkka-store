-- CreateTable
CREATE TABLE "product_variant_image" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT NOT NULL,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_variant_image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_variant_image_variantId_idx" ON "product_variant_image"("variantId");

-- AddForeignKey
ALTER TABLE "product_variant_image" ADD CONSTRAINT "product_variant_image_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
