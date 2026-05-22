import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/admin/content/save')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });
          if (!session?.user || session.user.role !== 'ADMIN') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }
          const { slug, title, content, published } = await request.json();
          if (!slug || !title || !content) {
            return Response.json(
              { error: 'slug, title, content required' },
              { status: 400 },
            );
          }
          const block = await prisma.contentBlock.upsert({
            where: { slug },
            create: { slug, title, content, published: !!published },
            update: { title, content, published: !!published },
          });
          return Response.json({ block });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : 'Failed' },
            { status: 500 },
          );
        }
      },
    },
  },
});
