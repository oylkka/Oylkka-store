import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { UploadImage } from '@/cloudinary';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/slug';
import { ShopApiSchema } from '@/schemas/shop-schema';

export const Route = createFileRoute('/api/shop/apply')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const existing = await prisma.shop.findUnique({
            where: { ownerId: session.user.id },
          });

          if (existing) {
            return Response.json(
              { error: 'You already own a shop' },
              { status: 409 },
            );
          }

          const formData = await request.formData();

          // biome-ignore lint: error
          const data: Record<string, any> = {};
          for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
              data[key] = value;
            } else {
              data[key] = value;
            }
          }

          const textFields = { ...data };
          delete textFields.logo;
          delete textFields.banner;

          for (const key of Object.keys(textFields)) {
            if (textFields[key] === '') textFields[key] = undefined;
          }

          const parsed = ShopApiSchema.safeParse(textFields);
          if (!parsed.success) {
            return Response.json(
              {
                error: 'Validation failed',
                details: parsed.error.flatten(),
              },
              { status: 400 },
            );
          }

          const baseSlug = slugify(parsed.data.name);
          if (!baseSlug) {
            return Response.json(
              { error: 'Invalid shop name — unable to generate slug' },
              { status: 400 },
            );
          }

          let slug = baseSlug;
          let counter = 1;
          while (await prisma.shop.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
          }

          let logoUrl: string | null = null;
          let logoPublicId: string | null = null;
          let bannerUrl: string | null = null;
          let bannerPublicId: string | null = null;

          const logoFile = data.logo;
          if (logoFile instanceof File && logoFile.size > 0) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(logoFile.type)) {
              return Response.json(
                { error: 'Logo must be JPEG, PNG, or WEBP' },
                { status: 400 },
              );
            }

            const maxSize = 512000;
            if (logoFile.size > maxSize) {
              return Response.json(
                { error: 'Logo size must not exceed 500KB' },
                { status: 400 },
              );
            }

            const result = await UploadImage(logoFile, 'shops');
            logoUrl = result.secure_url;
            logoPublicId = result.public_id;
          }

          const bannerFile = data.banner;
          if (bannerFile instanceof File && bannerFile.size > 0) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(bannerFile.type)) {
              return Response.json(
                { error: 'Banner must be JPEG, PNG, or WEBP' },
                { status: 400 },
              );
            }

            const maxSize = 512000;
            if (bannerFile.size > maxSize) {
              return Response.json(
                { error: 'Banner size must not exceed 500KB' },
                { status: 400 },
              );
            }

            const result = await UploadImage(bannerFile, 'shops');
            bannerUrl = result.secure_url;
            bannerPublicId = result.public_id;
          }

          const shop = await prisma.shop.create({
            data: {
              name: parsed.data.name,
              slug,
              description: parsed.data.description || null,
              email: parsed.data.email,
              phone: parsed.data.phone || null,
              website: parsed.data.website || null,
              addressLine1: parsed.data.addressLine1 || null,
              addressLine2: parsed.data.addressLine2 || null,
              city: parsed.data.city || null,
              state: parsed.data.state || null,
              country: parsed.data.country || null,
              postalCode: parsed.data.postalCode || null,
              logoUrl,
              logoPublicId,
              bannerUrl,
              bannerPublicId,
              status: 'PENDING',
              ownerId: session.user.id,
            },
          });

          return Response.json(
            { message: 'Shop application submitted successfully', shop },
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
