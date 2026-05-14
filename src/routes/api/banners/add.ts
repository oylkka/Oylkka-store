import { UploadImage } from '@/cloudinary';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { BannerApiSchema } from '@/schemas/banner-schema';
import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';

export const Route = createFileRoute('/api/banners/add')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // 1. Auth
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });
          if (!session?.user || session.user.role !== 'ADMIN') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // 2. Parse form data
          const formData = await request.formData();

          // biome-ignore lint: error
          const data: Record<string, any> = {};
          for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
              data[key] = value;
            } else if (key === 'startDate' || key === 'endDate') {
              data[key] = value ? new Date(value as string) : undefined;
            } else {
              data[key] = value;
            }
          }

          // 3. Validate text fields
          const textFields = { ...data };
          delete textFields.image;

          // Normalize empty strings to undefined for optional fields
          for (const key of Object.keys(textFields)) {
            if (textFields[key] === '') textFields[key] = undefined;
          }

          const parsed = BannerApiSchema.safeParse(textFields);
          if (!parsed.success) {
            return Response.json(
              {
                error: 'Validation failed',
                details: parsed.error.flatten(),
              },
              { status: 400 },
            );
          }

          // 4. Validate image file
          const imageFile = data.image;
          if (!(imageFile instanceof File) || imageFile.size === 0) {
            return Response.json(
              { error: 'Image file is required' },
              { status: 400 },
            );
          }

          const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(imageFile.type)) {
            return Response.json(
              { error: 'Image must be JPEG, PNG, or WEBP' },
              { status: 400 },
            );
          }

          const maxSize = 512000;
          if (imageFile.size > maxSize) {
            return Response.json(
              { error: 'Image size must not exceed 500KB' },
              { status: 400 },
            );
          }

          // 5. Upload to Cloudinary
          const result = await UploadImage(imageFile, 'banners');

          // 6. Create banner
          const banner = await prisma.banner.create({
            data: {
              title: parsed.data.title,
              subTitle: parsed.data.subtitle || null,
              description: parsed.data.description || null,
              bannerTag: parsed.data.bannerTag || null,
              alignment: parsed.data.alignment,
              primaryActionText: parsed.data.primaryActionText || null,
              primaryActionLink: parsed.data.primaryActionLink || null,
              secondaryActionText: parsed.data.secondaryActionText || null,
              secondaryActionLink: parsed.data.secondaryActionLink || null,
              bannerPosition: parsed.data.bannerPosition,
              startDate: parsed.data.startDate,
              endDate: parsed.data.endDate,
              imageUrl: result.secure_url,
              imagePublicId: result.public_id,
            },
          });

          return Response.json(
            { message: 'Banner created successfully', banner },
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
