-- DropIndex
DROP INDEX "conversations_customerId_idx";

-- DropIndex
DROP INDEX "conversations_shopId_idx";

-- DropIndex
DROP INDEX "messages_conversationId_idx";

-- CreateIndex
CREATE INDEX "conversations_customerId_lastMessageAt_idx" ON "conversations"("customerId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "conversations_shopId_lastMessageAt_idx" ON "conversations"("shopId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");
