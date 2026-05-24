import { createFileRoute } from '@tanstack/react-router';
import { requireAdmin, requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/banners/get-single')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdmin(authResult.session);
          if (roleResponse) return roleResponse;

          const { id } = (await request.json()) as { id: string };

          if (!id) {
            return Response.json(
              { error: 'Banner ID is required' },
              { status: 400 },
            );
          }

          const banner = await prisma.banner.findUnique({ where: { id } });

          if (!banner) {
            return Response.json(
              { error: 'Banner not found' },
              { status: 404 },
            );
          }

          return Response.json(banner, { status: 200 });
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
