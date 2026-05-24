import { createFileRoute } from '@tanstack/react-router';
import { DeleteImage } from '@/cloudinary';
import { requireAdmin, requireAuth } from '@/lib/auth-middleware';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/banners/delete')({
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

          await DeleteImage(banner.imagePublicId);

          await prisma.banner.delete({ where: { id } });

          return Response.json({ success: true }, { status: 200 });
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
