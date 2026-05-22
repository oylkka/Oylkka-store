import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/product/answer-question')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const { questionId, answer } = await request.json();

          if (!questionId || !answer) {
            return Response.json(
              { error: 'questionId and answer are required' },
              { status: 400 },
            );
          }

          if (answer.length < 10) {
            return Response.json(
              { error: 'Answer must be at least 10 characters' },
              { status: 400 },
            );
          }

          const question = await prisma.productQuestion.findUnique({
            where: { id: questionId },
            include: {
              product: { select: { shopId: true } },
            },
          });

          if (!question) {
            return Response.json(
              { error: 'Question not found' },
              { status: 404 },
            );
          }

          const shop = await prisma.shop.findUnique({
            where: { ownerId: session.user.id },
          });

          if (!shop || question.product.shopId !== shop.id) {
            if (
              session.user.role !== 'ADMIN' &&
              session.user.role !== 'MANAGER'
            ) {
              return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
          }

          const updated = await prisma.productQuestion.update({
            where: { id: questionId },
            data: {
              answer,
              answeredAt: new Date(),
              answeredBy: session.user.id,
            },
            select: {
              id: true,
              question: true,
              answer: true,
              answeredAt: true,
              createdAt: true,
              user: {
                select: { id: true, name: true },
              },
            },
          });

          return Response.json(updated, { status: 200 });
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Internal Server Error',
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
