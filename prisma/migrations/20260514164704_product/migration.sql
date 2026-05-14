-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'USED', 'REFURBISHED');

-- CreateEnum
CREATE TYPE "ShopStatus" AS ENUM ('PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "parentId" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "tags" TEXT[],
    "sku" TEXT NOT NULL,
    "brand" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "hasVariants" BOOLEAN NOT NULL DEFAULT false,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "condition" "ProductCondition" NOT NULL,
    "conditionDescription" TEXT,
    "weight" DOUBLE PRECISION,
    "weightUnit" TEXT NOT NULL DEFAULT 'kg',
    "freeShipping" BOOLEAN NOT NULL DEFAULT false,
    "dimensionLength" DOUBLE PRECISION,
    "dimensionWidth" DOUBLE PRECISION,
    "dimensionHeight" DOUBLE PRECISION,
    "dimensionUnit" TEXT NOT NULL DEFAULT 'cm',
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "shopId" TEXT,
    "createdBy" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_image" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT NOT NULL,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attribute_option" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "values" TEXT[],

    CONSTRAINT "product_attribute_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "attributes" JSONB NOT NULL,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_question" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "answeredAt" TIMESTAMP(3),
    "answeredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderItemId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "reported" BOOLEAN NOT NULL DEFAULT false,
    "reportReason" TEXT,
    "reviewedByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "vendorReply" TEXT,
    "vendorRepliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_image" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_helpful_vote" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_helpful_vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_item" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_item" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "savedPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "logoPublicId" TEXT,
    "bannerUrl" TEXT,
    "bannerPublicId" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "status" "ShopStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "suspendedAt" TIMESTAMP(3),
    "suspendedReason" TEXT,
    "bankName" TEXT,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "note" TEXT,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_item" (
    "id" TEXT NOT NULL,
    "payoutId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "payout_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "shippingName" TEXT NOT NULL,
    "shippingEmail" TEXT NOT NULL,
    "shippingPhone" TEXT,
    "shippingAddressLine1" TEXT NOT NULL,
    "shippingAddressLine2" TEXT,
    "shippingCity" TEXT NOT NULL,
    "shippingState" TEXT,
    "shippingCountry" TEXT NOT NULL,
    "shippingPostalCode" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paymentRef" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "couponCode" TEXT,
    "couponDiscount" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "productName" TEXT NOT NULL,
    "variantName" TEXT,
    "imageUrl" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "total" DOUBLE PRECISION NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "vendorAmount" DOUBLE PRECISION NOT NULL,
    "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'PENDING',
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_slug_key" ON "category"("slug");

-- CreateIndex
CREATE INDEX "category_parentId_idx" ON "category"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_key" ON "product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_sku_key" ON "product"("sku");

-- CreateIndex
CREATE INDEX "product_categoryId_idx" ON "product"("categoryId");

-- CreateIndex
CREATE INDEX "product_createdBy_idx" ON "product"("createdBy");

-- CreateIndex
CREATE INDEX "product_shopId_idx" ON "product"("shopId");

-- CreateIndex
CREATE INDEX "product_status_idx" ON "product"("status");

-- CreateIndex
CREATE INDEX "product_featured_idx" ON "product"("featured");

-- CreateIndex
CREATE INDEX "product_image_productId_idx" ON "product_image"("productId");

-- CreateIndex
CREATE INDEX "product_attribute_option_productId_idx" ON "product_attribute_option"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_attribute_option_productId_name_key" ON "product_attribute_option"("productId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_sku_key" ON "product_variant"("sku");

-- CreateIndex
CREATE INDEX "product_variant_productId_idx" ON "product_variant"("productId");

-- CreateIndex
CREATE INDEX "product_question_productId_idx" ON "product_question"("productId");

-- CreateIndex
CREATE INDEX "product_question_userId_idx" ON "product_question"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "review_orderItemId_key" ON "review"("orderItemId");

-- CreateIndex
CREATE INDEX "review_productId_idx" ON "review"("productId");

-- CreateIndex
CREATE INDEX "review_userId_idx" ON "review"("userId");

-- CreateIndex
CREATE INDEX "review_verified_idx" ON "review"("verified");

-- CreateIndex
CREATE INDEX "review_reported_idx" ON "review"("reported");

-- CreateIndex
CREATE INDEX "review_image_reviewId_idx" ON "review_image"("reviewId");

-- CreateIndex
CREATE INDEX "review_helpful_vote_reviewId_idx" ON "review_helpful_vote"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "review_helpful_vote_reviewId_userId_key" ON "review_helpful_vote"("reviewId", "userId");

-- CreateIndex
CREATE INDEX "wishlist_item_userId_idx" ON "wishlist_item"("userId");

-- CreateIndex
CREATE INDEX "wishlist_item_productId_idx" ON "wishlist_item"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_item_userId_productId_variantId_key" ON "wishlist_item"("userId", "productId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_userId_key" ON "cart"("userId");

-- CreateIndex
CREATE INDEX "cart_item_cartId_idx" ON "cart_item"("cartId");

-- CreateIndex
CREATE INDEX "cart_item_productId_idx" ON "cart_item"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "shop_slug_key" ON "shop"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "shop_ownerId_key" ON "shop"("ownerId");

-- CreateIndex
CREATE INDEX "shop_status_idx" ON "shop"("status");

-- CreateIndex
CREATE INDEX "shop_ownerId_idx" ON "shop"("ownerId");

-- CreateIndex
CREATE INDEX "payout_shopId_idx" ON "payout"("shopId");

-- CreateIndex
CREATE INDEX "payout_status_idx" ON "payout"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payout_item_orderItemId_key" ON "payout_item"("orderItemId");

-- CreateIndex
CREATE INDEX "payout_item_payoutId_idx" ON "payout_item"("payoutId");

-- CreateIndex
CREATE UNIQUE INDEX "order_orderNumber_key" ON "order"("orderNumber");

-- CreateIndex
CREATE INDEX "order_customerId_idx" ON "order"("customerId");

-- CreateIndex
CREATE INDEX "order_status_idx" ON "order"("status");

-- CreateIndex
CREATE INDEX "order_paymentStatus_idx" ON "order"("paymentStatus");

-- CreateIndex
CREATE INDEX "order_item_orderId_idx" ON "order_item"("orderId");

-- CreateIndex
CREATE INDEX "order_item_shopId_idx" ON "order_item"("shopId");

-- CreateIndex
CREATE INDEX "order_item_productId_idx" ON "order_item"("productId");

-- CreateIndex
CREATE INDEX "order_item_fulfillmentStatus_idx" ON "order_item"("fulfillmentStatus");

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_option" ADD CONSTRAINT "product_attribute_option_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_question" ADD CONSTRAINT "product_question_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_image" ADD CONSTRAINT "review_image_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_helpful_vote" ADD CONSTRAINT "review_helpful_vote_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_helpful_vote" ADD CONSTRAINT "review_helpful_vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_item" ADD CONSTRAINT "wishlist_item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_item" ADD CONSTRAINT "wishlist_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_item" ADD CONSTRAINT "wishlist_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop" ADD CONSTRAINT "shop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout" ADD CONSTRAINT "payout_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_item" ADD CONSTRAINT "payout_item_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "payout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_item" ADD CONSTRAINT "payout_item_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
