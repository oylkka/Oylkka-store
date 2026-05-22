-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'AWAITING_SHIPMENT', 'SHIPPED', 'RECEIVED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ReturnReason" AS ENUM ('DEFECTIVE', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'SIZE_ISSUE', 'DAMAGED', 'UNWANTED', 'OTHER');

-- CreateTable
CREATE TABLE "return_request" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemIds" TEXT[],
    "customerId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "reason" "ReturnReason" NOT NULL,
    "details" TEXT,
    "images" TEXT[],
    "status" "ReturnStatus" NOT NULL DEFAULT 'PENDING',
    "resolution" TEXT,
    "refundAmount" DOUBLE PRECISION,
    "adminNote" TEXT,
    "customerTrackingNumber" TEXT,
    "customerTrackingUrl" TEXT,
    "returnLabelUrl" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "return_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "return_request_orderId_idx" ON "return_request"("orderId");

-- CreateIndex
CREATE INDEX "return_request_customerId_idx" ON "return_request"("customerId");

-- CreateIndex
CREATE INDEX "return_request_shopId_idx" ON "return_request"("shopId");

-- CreateIndex
CREATE INDEX "return_request_status_idx" ON "return_request"("status");

-- AddForeignKey
ALTER TABLE "return_request" ADD CONSTRAINT "return_request_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_request" ADD CONSTRAINT "return_request_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_request" ADD CONSTRAINT "return_request_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
