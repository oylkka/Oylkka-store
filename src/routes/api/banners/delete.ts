import { DeleteImage } from '@/cloudinary';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';

export const Route = createFileRoute('/api/banners/delete')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user || session.user.role !== 'ADMIN') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { id } = await request.json() as { id: string };

          if (!id) {
            return Response.json({ error: 'Banner ID is required' }, { status: 400 });
          }

          const banner = await prisma.banner.findUnique({ where: { id } });

          if (!banner) {
            return Response.json({ error: 'Banner not found' }, { status: 404 });
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
