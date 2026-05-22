import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { DeleteImage } from '@/cloudinary/delete-image';
import { UploadImage } from '@/cloudinary/upload-image';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { ShopApiSchema } from '@/schemas/shop-schema';

export const Route = createFileRoute('/api/shop/update')({
  server: {
    handlers: {
      PATCH: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const shop = await prisma.shop.findUnique({
            where: { ownerId: session.user.id },
          });

          if (!shop) {
            return Response.json({ error: 'Shop not found' }, { status: 404 });
          }

          const formData = await request.formData();

          const data: Record<string, unknown> = {};
          for (const [key, value] of formData.entries()) {
            data[key] = value instanceof File ? value : value;
          }

          const textFields = { ...data };
          delete textFields.logo;
          delete textFields.banner;
          delete textFields.keepExistingLogo;
          delete textFields.keepExistingBanner;
          delete textFields.hasExistingLogo;
          delete textFields.hasExistingBanner;

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

          let logoUrl = shop.logoUrl;
          let logoPublicId = shop.logoPublicId;
          let bannerUrl = shop.bannerUrl;
          let bannerPublicId = shop.bannerPublicId;

          const keepLogo =
            data.keepExistingLogo === 'true' || data.keepExistingLogo === true;
          const keepBanner =
            data.keepExistingBanner === 'true' ||
            data.keepExistingBanner === true;

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

            if (shop.logoPublicId) {
              await DeleteImage(shop.logoPublicId).catch(() => {});
            }

            const result = await UploadImage(logoFile, 'shops');
            logoUrl = result.secure_url;
            logoPublicId = result.public_id;
          } else if (!keepLogo && shop.logoPublicId) {
            await DeleteImage(shop.logoPublicId).catch(() => {});
            logoUrl = null;
            logoPublicId = null;
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

            if (shop.bannerPublicId) {
              await DeleteImage(shop.bannerPublicId).catch(() => {});
            }

            const result = await UploadImage(bannerFile, 'shops');
            bannerUrl = result.secure_url;
            bannerPublicId = result.public_id;
          } else if (!keepBanner && shop.bannerPublicId) {
            await DeleteImage(shop.bannerPublicId).catch(() => {});
            bannerUrl = null;
            bannerPublicId = null;
          }

          const updated = await prisma.shop.update({
            where: { id: shop.id },
            data: {
              name: parsed.data.name,
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
            },
          });

          return Response.json(
            { message: 'Shop updated successfully', shop: updated },
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
