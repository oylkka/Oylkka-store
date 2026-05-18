import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/product/public-questions')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const productId = url.searchParams.get('productId');
          const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
          const limit = Math.min(
            20,
            Math.max(1, Number(url.searchParams.get('limit')) || 10),
          );

          if (!productId) {
            return Response.json(
              { error: 'productId is required' },
              { status: 400 },
            );
          }

          const [questions, total] = await Promise.all([
            prisma.productQuestion.findMany({
              where: { productId },
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
              orderBy: { createdAt: 'desc' },
              skip: (page - 1) * limit,
              take: limit,
            }),
            prisma.productQuestion.count({ where: { productId } }),
          ]);

          return Response.json(
            {
              questions,
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
            },
            { status: 200 },
          );
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

      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { productId, question } = await request.json();

          if (!productId || !question) {
            return Response.json(
              { error: 'productId and question are required' },
              { status: 400 },
            );
          }

          if (question.length < 10) {
            return Response.json(
              { error: 'Question must be at least 10 characters' },
              { status: 400 },
            );
          }

          if (question.length > 500) {
            return Response.json(
              { error: 'Question must be under 500 characters' },
              { status: 400 },
            );
          }

          const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true },
          });

          if (!product) {
            return Response.json(
              { error: 'Product not found' },
              { status: 404 },
            );
          }

          const created = await prisma.productQuestion.create({
            data: {
              productId,
              userId: session.user.id,
              question,
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

          return Response.json(created, { status: 201 });
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
