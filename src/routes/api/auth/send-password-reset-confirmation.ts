import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '@/lib/db';
import { passwordResetConfirmationHtml } from '@/lib/email-templates';
import { sendEmail } from '@/lib/send-email';

export const Route = createFileRoute(
  '/api/auth/send-password-reset-confirmation',
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { email } = (await request.json()) as { email: string };

          if (!email) {
            return Response.json(
              { error: 'Email is required' },
              { status: 400 },
            );
          }

          const user = await prisma.user.findUnique({
            where: { email },
            select: { name: true, email: true },
          });

          if (user) {
            sendEmail({
              to: user.email,
              subject: 'Your password has been changed',
              meta: {
                description: '',
                link: '',
                callToActionText: '',
              },
              html: passwordResetConfirmationHtml(user.name),
            });
          }

          // Always return success to prevent email enumeration
          return Response.json({ success: true });
        } catch {
          return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 },
          );
        }
      },
    },
  },
});
