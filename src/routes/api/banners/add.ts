import { UploadImage } from '@/features/cloudinary';
import { prisma } from '@/lib/db';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/banners/add')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const formData = await request.formData();

          // biome-ignore lint: error
          const data: Record<string, any> = {};
          for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
              data[key] = value;
            } else if (key === 'startDate' || key === 'endDate') {
              data[key] = value ? new Date(value as string) : null;
            } else {
              data[key] = value;
            }
          }

          // Upload image
          let imageData = null;
          const imageFile = data.image;
          if (imageFile instanceof File && imageFile.size > 0) {
            const result = await UploadImage(imageFile, 'banners');
            imageData = {
              url: result.secure_url,
              publicId: result.public_id,
              alt: data.title || 'Banner Image',
            };
          }

          if (!imageData) {
            return Response.json(
              { error: 'Image upload failed or missing' },
              { status: 400 },
            );
          }

          const banner = await prisma.banner.create({
            data: {
              title: data.title,
              subTitle: data.subtitle || null,
              description: data.description || null,
              bannerTag: data.bannerTag || null,
              alignment: data.alignment || 'center',
              primaryActionText: data.primaryActionText || null,
              primaryActionLink: data.primaryActionLink || null,
              secondaryActionText: data.secondaryActionText || null,
              secondaryActionLink: data.secondaryActionLink || null,
              bannerPosition: data.bannerPosition || 'home_top',
              startDate: data.startDate,
              endDate: data.endDate,
              image: imageData,
            },
          });

          return Response.json(
            { message: 'Banner created successfully', banner },
            { status: 200 },
          );
          // biome-ignore lint: error
        } catch (error) {
          return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 },
          );
        }
      },
    },
  },
});
