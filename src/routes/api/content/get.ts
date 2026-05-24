import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/content/get')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const slug = url.searchParams.get('slug');
          if (!slug) {
            return Response.json({ error: 'slug required' }, { status: 400 });
          }
          const block = await prisma.contentBlock.findUnique({
            where: { slug },
          });
          if (!block?.published) {
            return Response.json({ error: 'Not found' }, { status: 404 });
          }
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
