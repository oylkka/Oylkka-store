import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/send-email';

const contactSchema = z.object({
  shopId: z.string().min(1, 'Shop ID is required'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject is too long'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(2000, 'Message is too long'),
});

export const Route = createFileRoute('/api/messages/contact-vendor')({
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

          const body = await request.json();
          const parsed = contactSchema.safeParse(body);

          if (!parsed.success) {
            const firstError = parsed.error.errors[0];
            return Response.json(
              { error: firstError?.message || 'Invalid input' },
              { status: 400 },
            );
          }

          const { shopId, subject, message } = parsed.data;

          const shop = await prisma.shop.findUnique({
            where: { id: shopId },
            select: {
              name: true,
              ownerId: true,
            },
          });

          if (!shop) {
            return Response.json(
              { error: 'Vendor not found' },
              { status: 404 },
            );
          }

          const vendor = await prisma.user.findUnique({
            where: { id: shop.ownerId },
            select: { email: true, name: true },
          });

          if (!vendor?.email) {
            return Response.json(
              { error: 'Vendor not found' },
              { status: 404 },
            );
          }

          await sendEmail({
            to: vendor.email,
            subject: `New message about ${shop.name}: ${subject}`,
            meta: {
              description: `Message from ${session.user.name} (${session.user.email})`,
              link: '',
              callToActionText: 'View Message',
            },
            html: `
              <h2>New Contact Message</h2>
              <p><strong>From:</strong> ${session.user.name} (${session.user.email})</p>
              <p><strong>Shop:</strong> ${shop.name}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <hr />
              <p>${message.replace(/\n/g, '<br/>')}</p>
            `,
          });

          return Response.json(
            { message: 'Message sent to vendor' },
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
    },
  },
});
