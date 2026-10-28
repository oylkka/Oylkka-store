import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { publishMessageCreated } from '@/lib/ably';
import { requireAuth } from '@/lib/auth-middleware';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { logError } from '@/lib/logger';
import {
  conversationContextSelect,
  messageSummarySelect,
  toConversationContext,
  toMessageSummary,
} from '@/lib/messaging-view';
import { messageLimiter } from '@/lib/rate-limit';
import { checkRateLimit } from '@/lib/rate-limit-guard';
import { MESSAGE_MAX_LENGTH, SUBJECT_MAX_LENGTH } from '@/types/messaging';

const optionalContextId = z.preprocess((value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return value;
}, z.string().min(1).nullable().optional());

const createConversationSchema = z.object({
  shopId: z.string().trim().min(1),
  subject: z.string().trim().min(1).max(SUBJECT_MAX_LENGTH),
  message: z.string().trim().min(1).max(MESSAGE_MAX_LENGTH),
  productId: optionalContextId,
  orderId: optionalContextId,
});

class ConversationClosedError extends Error {
  constructor() {
    super('Conversation is closed');
    this.name = 'ConversationClosedError';
  }
}

export const Route = createFileRoute('/api/chat/conversations/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authResult = await requireAuth();
        if (authResult.response) return authResult.response;
        const userId = authResult.session.user.id;

        const csrfResponse = validateCsrf();
        if (csrfResponse) return csrfResponse;

        const rateLimitResponse = await checkRateLimit(
          messageLimiter,
          `user:${userId}`,
        );
        if (rateLimitResponse) return rateLimitResponse;

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const parsed = createConversationSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
            { status: 400 },
          );
        }

        const { shopId, subject, productId, orderId } = parsed.data;
        const messageContent = parsed.data.message;

        try {
          const shop = await prisma.shop.findUnique({
            where: { id: shopId },
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              ownerId: true,
              status: true,
            },
          });

          if (!shop) {
            return Response.json({ error: 'Shop not found' }, { status: 404 });
          }

          if (shop.status !== 'ACTIVE') {
            return Response.json(
              { error: 'Shop is not available' },
              { status: 400 },
            );
          }

          if (shop.ownerId === userId) {
            return Response.json(
              { error: 'You cannot message your own shop' },
              { status: 400 },
            );
          }

          if (productId) {
            const product = await prisma.product.findFirst({
              where: { id: productId, shopId },
              select: { id: true },
            });

            if (!product) {
              return Response.json(
                { error: 'Product does not belong to this shop' },
                { status: 400 },
              );
            }
          }

          if (orderId) {
            const order = await prisma.order.findFirst({
              where: {
                id: orderId,
                customerId: userId,
                items: { some: { shopId } },
              },
              select: { id: true },
            });

            if (!order) {
              return Response.json(
                {
                  error: 'Order does not belong to this customer and shop',
                },
                { status: 400 },
              );
            }
          }

          const existing = await prisma.conversation.findFirst({
            where: {
              customerId: userId,
              shopId,
              status: 'OPEN',
              orderId: orderId ?? null,
              productId: productId ?? null,
            },
            orderBy: { createdAt: 'desc' },
            select: conversationContextSelect,
          });

          const now = new Date();
          const result = await prisma.$transaction(async (tx) => {
            let conversation = existing;

            if (conversation) {
              const updated = await tx.conversation.updateMany({
                where: { id: conversation.id, status: 'OPEN' },
                data: { lastMessageAt: now },
              });

              if (updated.count === 0) {
                throw new ConversationClosedError();
              }

              conversation = { ...conversation, lastMessageAt: now };
            } else {
              conversation = await tx.conversation.create({
                data: {
                  customerId: userId,
                  shopId,
                  orderId: orderId ?? null,
                  productId: productId ?? null,
                  subject,
                  status: 'OPEN',
                  lastMessageAt: now,
                },
                select: conversationContextSelect,
              });
            }

            const message = await tx.message.create({
              data: {
                conversationId: conversation.id,
                senderId: userId,
                content: messageContent,
                createdAt: now,
              },
              select: messageSummarySelect,
            });

            return { conversation, message };
          });

          const conversation = toConversationContext(
            result.conversation,
            'customer',
          );
          const message = toMessageSummary(result.message);

          await publishMessageCreated(
            [result.conversation.customerId, shop.ownerId],
            {
              type: 'message.created',
              conversationId: result.conversation.id,
              message,
            },
          );

          return Response.json({ conversation, message }, { status: 201 });
        } catch (error) {
          if (error instanceof ConversationClosedError) {
            return Response.json(
              { error: 'Conversation is closed' },
              { status: 409 },
            );
          }

          logError('chat-conversations-create', error);
          return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 },
          );
        }
      },
    },
  },
});
