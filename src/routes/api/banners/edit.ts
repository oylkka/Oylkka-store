import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { DeleteImage, UploadImage } from '@/cloudinary';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { BannerApiSchema } from '@/schemas/banner-schema';

export const Route = createFileRoute('/api/banners/edit')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user || session.user.role !== 'ADMIN') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

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

          const id = data.id as string;
          if (!id) {
            return Response.json(
              { error: 'Banner ID is required' },
              { status: 400 },
            );
          }

          const existingBanner = await prisma.banner.findUnique({
            where: { id },
          });
          if (!existingBanner) {
            return Response.json(
              { error: 'Banner not found' },
              { status: 404 },
            );
          }

          const textFields = { ...data };
          delete textFields.image;
          delete textFields.id;
          delete textFields.keepExistingImage;

          for (const key of Object.keys(textFields)) {
            if (textFields[key] === '') textFields[key] = undefined;
          }

          const parsed = BannerApiSchema.safeParse(textFields);
          if (!parsed.success) {
            return Response.json(
              { error: 'Validation failed', details: parsed.error.flatten() },
              { status: 400 },
            );
          }

          let imageUrl = existingBanner.imageUrl;
          let imagePublicId = existingBanner.imagePublicId;

          const imageFile = data.image;
          const keepExisting = data.keepExistingImage === 'true';

          if (
            imageFile instanceof File &&
            imageFile.size > 0 &&
            !keepExisting
          ) {
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

            await DeleteImage(existingBanner.imagePublicId);

            const result = await UploadImage(imageFile, 'banners');
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
          }

          const banner = await prisma.banner.update({
            where: { id },
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
              imageUrl,
              imagePublicId,
            },
          });

          return Response.json(
            { message: 'Banner updated successfully', banner },
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
