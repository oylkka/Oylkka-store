-- Rejecting a listing has to tell the vendor what to fix, the same way
-- `shop.rejectionReason` does for shop applications. Nullable: only the
-- REJECTED state carries a reason, and it is cleared whenever the product
-- leaves that state.

-- AlterTable
ALTER TABLE "product" ADD COLUMN "rejectionReason" TEXT;
