import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { messageLimiter } from '@/lib/rate-limit';
import { checkRateLimit } from '@/lib/rate-limit-guard';

const createSchema = z.object({
  shopId: z.string().min(1),
  subject: z.string().min(1).max(200),
  orderId: z.string().optional(),
  productId: z.string().optional(),
  message: z.string().min(1).max(2000),
});

export const Route = createFileRoute('/api/conversations/create')({
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

          const rateLimitResponse = await checkRateLimit(messageLimiter);
          if (rateLimitResponse) return rateLimitResponse;

          const body = await request.json();
          const parsed = createSchema.safeParse(body);
          if (!parsed.success) {
            return Response.json(
              { error: parsed.error.errors[0]?.message || 'Invalid input' },
              { status: 400 },
            );
          }

          const { shopId, subject, orderId, productId, message } = parsed.data;

          const shop = await prisma.shop.findUnique({
            where: { id: shopId },
            select: { id: true, name: true, ownerId: true },
          });
          if (!shop) {
            return Response.json({ error: 'Shop not found' }, { status: 404 });
          }

          if (session.user.id === shop.ownerId) {
            return Response.json(
              { error: 'Cannot create conversation with your own shop' },
              { status: 400 },
            );
          }

          const conversation = await prisma.conversation.create({
            data: {
              customerId: session.user.id,
              shopId,
              orderId: orderId || null,
              productId: productId || null,
              subject,
              lastMessageAt: new Date(),
              messages: {
                create: {
                  senderId: session.user.id,
                  content: message,
                },
              },
            },
            include: {
              messages: {
                orderBy: { createdAt: 'asc' },
                take: 1,
              },
            },
          });

          sendNewMessageEmail(
            shop.ownerId,
            shop.name,
            session.user.name || 'A customer',
            subject,
            message,
          ).catch(() => {});

          return Response.json({ conversation }, { status: 201 });
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

async function sendNewMessageEmail(
  ownerId: string,
  shopName: string,
  customerName: string,
  subject: string,
  message: string,
) {
  try {
    const { prisma } = await import('@/lib/db');
    const { sendEmail } = await import('@/lib/send-email');
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { email: true },
    });
    if (!owner?.email) return;

    await sendEmail({
      to: owner.email,
      subject: `New message about ${shopName}: ${subject}`,
      meta: {
        description: `${customerName} sent you a message about ${shopName}.`,
        link: `${process.env.BETTER_AUTH_URL || ''}/dashboard/vendor/shop/messages`,
        callToActionText: 'View Messages',
      },
      html: `
        <h2>New Customer Message</h2>
        <p><strong>From:</strong> ${customerName}</p>
        <p><strong>Shop:</strong> ${shopName}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });
  } catch {
    // fire-and-forget
  }
}
