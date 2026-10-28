import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth-middleware';
import { getConversationAccess } from '@/lib/conversation-access';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { logError } from '@/lib/logger';
import {
  conversationContextSelect,
  toConversationContext,
} from '@/lib/messaging-view';

const updateConversationSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('read') }),
  z.object({ action: z.literal('close') }),
]);

export const Route = createFileRoute('/api/chat/conversations/$conversationId')(
  {
    server: {
      handlers: {
        GET: async ({ params }) => {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;

          try {
            const accessResult = await getConversationAccess(
              params.conversationId,
              authResult.session.user.id,
            );
            if (accessResult.response) return accessResult.response;

            const conversation = await prisma.conversation.findUnique({
              where: { id: params.conversationId },
              select: conversationContextSelect,
            });

            if (!conversation) {
              return Response.json(
                { error: 'Conversation not found' },
                { status: 404 },
              );
            }

            return Response.json({
              conversation: toConversationContext(
                conversation,
                accessResult.access.participant,
              ),
            });
          } catch (error) {
            logError('chat-conversation-detail', error);
            return Response.json(
              { error: 'Internal Server Error' },
              { status: 500 },
            );
          }
        },
        PATCH: async ({ params, request }) => {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const userId = authResult.session.user.id;

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          let body: unknown;
          try {
            body = await request.json();
          } catch {
            return Response.json(
              { error: 'Invalid JSON body' },
              { status: 400 },
            );
          }

          const parsed = updateConversationSchema.safeParse(body);
          if (!parsed.success) {
            return Response.json({ error: 'Invalid action' }, { status: 400 });
          }

          try {
            const accessResult = await getConversationAccess(
              params.conversationId,
              userId,
            );
            if (accessResult.response) return accessResult.response;

            if (parsed.data.action === 'read') {
              const result = await prisma.message.updateMany({
                where: {
                  conversationId: params.conversationId,
                  senderId: { not: userId },
                  isRead: false,
                },
                data: { isRead: true },
              });

              return Response.json({
                success: true,
                updated: result.count,
              });
            }

            await prisma.conversation.update({
              where: { id: params.conversationId },
              data: { status: 'CLOSED' },
              select: { status: true },
            });

            return Response.json({ success: true, status: 'CLOSED' });
          } catch (error) {
            logError('chat-conversation-update', error);
            return Response.json(
              { error: 'Internal Server Error' },
              { status: 500 },
            );
          }
        },
      },
    },
  },
);
