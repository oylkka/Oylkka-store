import { createFileRoute } from '@tanstack/react-router';
import { requireAdmin, requireAuth } from '@/lib/auth-middleware';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/settings/update')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdmin(authResult.session);
          if (roleResponse) return roleResponse;

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const { settings }: { settings: Record<string, string> } =
            await request.json();
          for (const [key, value] of Object.entries(settings)) {
            await prisma.siteSetting.upsert({
              where: { key },
              create: { key, value },
              update: { value },
            });
          }
          return Response.json({ message: 'Settings updated' });
        } catch (_error) {
          return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 },
          );
        }
      },
    },
  },
});
