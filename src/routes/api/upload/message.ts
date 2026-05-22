import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { generalLimiter } from '@/lib/rate-limit';
import { checkRateLimit } from '@/lib/rate-limit-guard';

export const Route = createFileRoute('/api/upload/message')({
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

          const rateLimitResponse = await checkRateLimit(generalLimiter);
          if (rateLimitResponse) return rateLimitResponse;

          const formData = await request.formData();
          const file = formData.get('image') as File | null;

          if (!file || file.size === 0) {
            return Response.json(
              { error: 'Image file is required' },
              { status: 400 },
            );
          }

          const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
          ];
          if (!allowedTypes.includes(file.type)) {
            return Response.json(
              { error: 'Only JPEG, PNG, WebP, and GIF images are allowed' },
              { status: 400 },
            );
          }

          if (file.size > 5 * 1024 * 1024) {
            return Response.json(
              { error: 'Image must be under 5MB' },
              { status: 400 },
            );
          }

          const { UploadImage } = await import('@/cloudinary/upload-image');
          const result = await UploadImage(file, 'messages');

          return Response.json({
            imageUrl: result.secure_url,
            imagePublicId: result.public_id,
          });
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
