import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { DeleteImage, UploadImage } from '@/cloudinary';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/slug';

export const Route = createFileRoute('/api/product/edit')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const shop = await prisma.shop.findUnique({
            where: { ownerId: session.user.id },
          });

          if (!shop || shop.status !== 'ACTIVE') {
            return Response.json(
              { error: 'You need an active shop to edit products' },
              { status: 403 },
            );
          }

          const formData = await request.formData();
          const data: Record<string, unknown> = {};

          for (const [key, value] of formData.entries()) {
            if (key === 'productImages') {
              if (!data.productImages) data.productImages = [];
              (data.productImages as File[]).push(value as File);
            } else if (key.startsWith('variantImage_')) {
              if (!data.variantImages) data.variantImages = {};
              const variantId = key.replace('variantImage_', '');
              (data.variantImages as Record<string, File>)[variantId] =
                value as File;
            } else if (value instanceof File) {
              if (key === 'gallery') {
                if (!data.gallery) data.gallery = [];
                (data.gallery as File[]).push(value);
              } else {
                data[key] = value;
              }
            } else if (
              key === 'hasVariants' ||
              key === 'freeShipping' ||
              key === 'featured' ||
              key === 'keepExistingImage'
            ) {
              data[key] = value === 'true';
            } else if (
              key === 'price' ||
              key === 'discountPrice' ||
              key === 'stock' ||
              key === 'weight' ||
              key === 'lowStockAlert'
            ) {
              data[key] = value ? Number(value) : undefined;
            } else if (
              key === 'dimensions' ||
              key === 'attributes' ||
              key === 'variants'
            ) {
              try {
                data[key] = JSON.parse(value as string);
              } catch {
                data[key] = undefined;
              }
            } else if (key === 'removedGalleryIds') {
              try {
                data[key] = JSON.parse(value as string);
              } catch {
                data[key] = [];
              }
            } else if (key === 'tags') {
              if (!data.tags) data.tags = [];
              (data.tags as string[]).push(value as string);
            } else {
              data[key] = value;
            }
          }

          const productId = data.id as string;
          if (!productId) {
            return Response.json(
              { error: 'Product ID is required' },
              { status: 400 },
            );
          }

          const existing = await prisma.product.findUnique({
            where: { id: productId },
            include: { images: true, variants: true, attributeOptions: true },
          });

          if (!existing) {
            return Response.json(
              { error: 'Product not found' },
              { status: 404 },
            );
          }

          if (existing.shopId !== shop.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // Map field names
          const categoryId =
            (data.category as string) ||
            (data.categoryId as string) ||
            existing.categoryId;

          // Handle dimensions
          const dims = data.dimensions as Record<string, unknown> | undefined;
          let dimensionLength = existing.dimensionLength;
          let dimensionWidth = existing.dimensionWidth;
          let dimensionHeight = existing.dimensionHeight;
          let dimensionUnit = existing.dimensionUnit;

          if (dims) {
            dimensionLength =
              (dims.length as number) ?? existing.dimensionLength;
            dimensionWidth = (dims.width as number) ?? existing.dimensionWidth;
            dimensionHeight =
              (dims.height as number) ?? existing.dimensionHeight;
            dimensionUnit = (dims.unit as string) || existing.dimensionUnit;
          } else if (data.dimensionLength !== undefined) {
            dimensionLength = data.dimensionLength as number;
            dimensionWidth = data.dimensionWidth as number;
            dimensionHeight = data.dimensionHeight as number;
            dimensionUnit =
              (data.dimensionUnit as string) || existing.dimensionUnit;
          }

          // Generate slug if name changed
          const nameChanged = data.productName !== existing.productName;
          let slug = existing.slug;
          if (nameChanged) {
            const baseSlug = slugify(data.productName as string);
            if (!baseSlug) {
              return Response.json(
                { error: 'Invalid product name — unable to generate slug' },
                { status: 400 },
              );
            }
            slug = baseSlug;
            let counter = 1;
            while (
              await prisma.product.findUnique({
                where: { slug, NOT: { id: productId } },
              })
            ) {
              slug = `${baseSlug}-${counter}`;
              counter++;
            }
          }

          // Handle main image
          let imageUrl = existing.imageUrl;
          let imagePublicId = existing.imagePublicId;
          const keepExistingImage = data.keepExistingImage === true;
          const productImages = data.productImages as File[] | undefined;

          if (!keepExistingImage && productImages && productImages.length > 0) {
            const firstImage = productImages[0];
            if (firstImage instanceof File && firstImage.size > 0) {
              if (existing.imagePublicId) {
                await DeleteImage(existing.imagePublicId).catch(() => {});
              }

              const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
              if (!allowedTypes.includes(firstImage.type)) {
                return Response.json(
                  { error: 'Image must be JPEG, PNG, or WEBP' },
                  { status: 400 },
                );
              }

              const maxSize = 2_097_152;
              if (firstImage.size > maxSize) {
                return Response.json(
                  { error: 'Image size must not exceed 2MB' },
                  { status: 400 },
                );
              }

              const result = await UploadImage(firstImage, 'products');
              imageUrl = result.secure_url;
              imagePublicId = result.public_id;
            }
          } else if (!keepExistingImage && !productImages) {
            if (existing.imagePublicId) {
              await DeleteImage(existing.imagePublicId).catch(() => {});
            }
            imageUrl = null;
            imagePublicId = null;
          }

          // Handle gallery images
          const removedGalleryIds: string[] =
            (data.removedGalleryIds as string[]) || [];
          if (removedGalleryIds.length > 0) {
            const removedImages = existing.images.filter((img) =>
              removedGalleryIds.includes(img.id),
            );
            for (const img of removedImages) {
              if (img.imagePublicId) {
                await DeleteImage(img.imagePublicId).catch(() => {});
              }
            }
            await prisma.productImage.deleteMany({
              where: { id: { in: removedGalleryIds }, productId },
            });
          }

          // Upload new gallery images from productImages (skip the first one if it replaced the main image)
          const newGalleryFiles = productImages ? productImages.slice(1) : [];
          const galleryData: Array<{
            imageUrl: string;
            imagePublicId: string;
            order: number;
          }> = [];

          const existingImages = await prisma.productImage.findMany({
            where: { productId },
            orderBy: { order: 'asc' },
          });
          const nextOrder = existingImages.length;

          for (let i = 0; i < newGalleryFiles.length; i++) {
            const file = newGalleryFiles[i];
            if (file instanceof File && file.size > 0) {
              const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
              if (!allowedTypes.includes(file.type)) {
                return Response.json(
                  {
                    error: `Gallery image ${i + 1} must be JPEG, PNG, or WEBP`,
                  },
                  { status: 400 },
                );
              }

              const maxSize = 2_097_152;
              if (file.size > maxSize) {
                return Response.json(
                  { error: `Gallery image ${i + 1} size must not exceed 2MB` },
                  { status: 400 },
                );
              }

              const result = await UploadImage(file, 'products/gallery');
              galleryData.push({
                imageUrl: result.secure_url,
                imagePublicId: result.public_id,
                order: nextOrder + i,
              });
            }
          }

          // Handle attributes update
          const attributes = data.attributes as
            | Record<string, string[]>
            | undefined;
          if (attributes) {
            await prisma.productAttributeOption.deleteMany({
              where: { productId },
            });
            if (Object.keys(attributes).length > 0) {
              await prisma.productAttributeOption.createMany({
                data: Object.entries(attributes).map(([name, values]) => ({
                  productId,
                  name,
                  values: Array.isArray(values) ? values : [values as string],
                })),
              });
            }
          }

          // Handle variants update
          const variants = data.variants as
            | Array<Record<string, unknown>>
            | undefined;
          if (variants) {
            // Delete existing variants
            await prisma.productVariant.deleteMany({
              where: { productId },
            });

            // Create new variants
            const variantImages = data.variantImages as
              | Record<string, File>
              | undefined;
            for (const v of variants) {
              const attrRecord = (v.attributes as Record<string, string>) || {};
              let variantImageUrl: string | null = null;
              let variantImagePublicId: string | null = null;

              const vId = v.id as string;
              const vImage = variantImages?.[vId];
              if (vImage instanceof File && vImage.size > 0) {
                const result = await UploadImage(vImage, 'products/variants');
                variantImageUrl = result.secure_url;
                variantImagePublicId = result.public_id;
              }

              await prisma.productVariant.create({
                data: {
                  productId,
                  name: v.name as string,
                  sku: v.sku as string,
                  price: (v.price as number) || 0,
                  discountPrice: (v.discountPrice as number) || null,
                  stock: (v.stock as number) || 0,
                  attributes: attrRecord,
                  imageUrl: variantImageUrl,
                  imagePublicId: variantImagePublicId,
                },
              });
            }
          }

          const product = await prisma.product.update({
            where: { id: productId },
            data: {
              productName: data.productName as string,
              slug,
              description: data.description as string,
              categoryId,
              tags: (data.tags as string[]) || existing.tags,
              sku: data.sku as string,
              brand: (data.brand as string) || null,
              price: (data.price as number) || existing.price,
              discountPrice:
                (data.discountPrice as number) ?? existing.discountPrice,
              stock: (data.stock as number) ?? existing.stock,
              hasVariants: !!(variants && variants.length > 0),
              condition:
                (data.condition as
                  | 'NEW'
                  | 'USED'
                  | 'LIKE_NEW'
                  | 'EXCELLENT'
                  | 'GOOD'
                  | 'FAIR'
                  | 'POOR'
                  | 'FOR_PARTS') || existing.condition,
              conditionDescription:
                (data.conditionDescription as string) ??
                existing.conditionDescription,
              weight: (data.weight as number) ?? existing.weight,
              weightUnit: (data.weightUnit as string) || existing.weightUnit,
              freeShipping:
                data.freeShipping === true || data.freeShipping === 'true',
              dimensionLength,
              dimensionWidth,
              dimensionHeight,
              dimensionUnit,
              imageUrl,
              imagePublicId,
              images:
                galleryData.length > 0 ? { create: galleryData } : undefined,
              metaTitle: (data.metaTitle as string) ?? existing.metaTitle,
              metaDescription:
                (data.metaDescription as string) ?? existing.metaDescription,
              status:
                (data.status as
                  | 'DRAFT'
                  | 'ACTIVE'
                  | 'ARCHIVED'
                  | 'OUT_OF_STOCK') || existing.status,
              featured: data.featured === true || data.featured === 'true',
            },
            include: {
              images: { orderBy: { order: 'asc' } },
              category: true,
              variants: true,
              attributeOptions: true,
            },
          });

          return Response.json(
            { message: 'Product updated successfully', product },
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
