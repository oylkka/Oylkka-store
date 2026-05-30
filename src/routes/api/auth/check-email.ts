import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/auth/check-email')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { email } = body;

          if (!email || typeof email !== 'string') {
            return Response.json(
              { error: 'Email is required' },
              { status: 400 },
            );
          }

          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
              id: true,
              accounts: {
                select: { providerId: true },
              },
            },
          });

          if (!user) {
            return Response.json({ exists: false, provider: null });
          }

          const providerIds = user.accounts.map((a) => a.providerId);

          // Prefer 'google' over 'credential' so we can suggest Google sign-in
          const provider = providerIds.includes('google')
            ? 'google'
            : providerIds.includes('credential')
              ? 'credential'
              : null;

          return Response.json({ exists: true, provider });
        } catch (error) {
          return Response.json(
            {
              exists: false,
              provider: null,
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
