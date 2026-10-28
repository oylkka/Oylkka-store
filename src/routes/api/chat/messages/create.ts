import { createFileRoute } from '@tanstack/react-router';
import { DeleteImage } from '@/cloudinary';
import { publishMessageCreated } from '@/lib/ably';
import { requireAuth } from '@/lib/auth-middleware';
import { getConversationAccess } from '@/lib/conversation-access';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { logError } from '@/lib/logger';
import { uploadMessageImage } from '@/lib/message-upload';
import { messageSummarySelect, toMessageSummary } from '@/lib/messaging-view';
import { messageLimiter } from '@/lib/rate-limit';
import { checkRateLimit } from '@/lib/rate-limit-guard';
import { MESSAGE_MAX_LENGTH, type MessageSummary } from '@/types/messaging';

class ConversationClosedError extends Error {
  constructor() {
    super('Conversation is closed');
    this.name = 'ConversationClosedError';
  }
}

export const Route = createFileRoute('/api/chat/messages/create')({
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

        let formData: FormData;
        try {
          formData = await request.formData();
        } catch {
          return Response.json(
            { error: 'Invalid multipart body' },
            { status: 400 },
          );
        }

        const conversationIdValue = formData.get('conversationId');
        if (
          typeof conversationIdValue !== 'string' ||
          conversationIdValue.trim().length === 0
        ) {
          return Response.json(
            { error: 'conversationId is required' },
            { status: 400 },
          );
        }
        const conversationId = conversationIdValue.trim();

        const contentValue = formData.get('content');
        if (contentValue !== null && typeof contentValue !== 'string') {
          return Response.json(
            { error: 'Invalid message content' },
            { status: 400 },
          );
        }
        const content = (contentValue ?? '').trim();

        if (content.length > MESSAGE_MAX_LENGTH) {
          return Response.json(
            {
              error: `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer`,
            },
            { status: 400 },
          );
        }

        const imageValue = formData.get('image');
        if (imageValue !== null && !(imageValue instanceof File)) {
          return Response.json({ error: 'Invalid image' }, { status: 400 });
        }
        const image =
          imageValue instanceof File && imageValue.size > 0 ? imageValue : null;

        if (!content && !image) {
          return Response.json(
            { error: 'Message cannot be empty' },
            { status: 400 },
          );
        }

        try {
          const accessResult = await getConversationAccess(
            conversationId,
            userId,
          );
          if (accessResult.response) return accessResult.response;

          if (accessResult.access.status === 'CLOSED') {
            return Response.json(
              { error: 'Conversation is closed' },
              { status: 409 },
            );
          }

          let uploaded: {
            imageUrl: string;
            imagePublicId: string;
          } | null = null;

          if (image) {
            const uploadResult = await uploadMessageImage(image);
            if ('error' in uploadResult) {
              return Response.json(
                { error: uploadResult.error },
                { status: 400 },
              );
            }
            uploaded = uploadResult;
          }

          const now = new Date();
          let message: MessageSummary;

          try {
            message = await prisma.$transaction(async (tx) => {
              const updated = await tx.conversation.updateMany({
                where: { id: conversationId, status: 'OPEN' },
                data: { lastMessageAt: now },
              });

              if (updated.count === 0) {
                throw new ConversationClosedError();
              }

              const createdMessage = await tx.message.create({
                data: {
                  conversationId,
                  senderId: userId,
                  content,
                  imageUrl: uploaded?.imageUrl ?? null,
                  imagePublicId: uploaded?.imagePublicId ?? null,
                  createdAt: now,
                },
                select: messageSummarySelect,
              });

              return toMessageSummary(createdMessage);
            });
          } catch (error) {
            if (uploaded) {
              try {
                await DeleteImage(uploaded.imagePublicId);
              } catch (cleanupError) {
                logError('chat-message-image-cleanup', cleanupError);
              }
            }

            if (error instanceof ConversationClosedError) {
              return Response.json(
                { error: 'Conversation is closed' },
                { status: 409 },
              );
            }

            throw error;
          }

          await publishMessageCreated(
            [accessResult.access.customerId, accessResult.access.vendorId],
            {
              type: 'message.created',
              conversationId,
              message,
            },
          );

          return Response.json({ message }, { status: 201 });
        } catch (error) {
          logError('chat-messages-create', error);
          return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 },
          );
        }
      },
    },
  },
});
