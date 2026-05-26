import { createFileRoute } from '@tanstack/react-router';
import { DeleteImage, UploadImage } from '@/cloudinary';
import { requireAuth } from '@/lib/auth-middleware';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/slug';
import { ProductApiEditSchema } from '@/schemas/product-api-schema';
import { SkuService } from '@/services/sku-service';

export const Route = createFileRoute('/api/product/edit')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const session = authResult.session;

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

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
              (data.productImages as File[]).push(value as unknown as File);
            } else if (key.startsWith('variantImage_')) {
              if (!data.variantImages) data.variantImages = {};
              const variantId = key.replace('variantImage_', '');
              (data.variantImages as Record<string, File>)[variantId] =
                value as unknown as File;
            } else if (typeof value !== 'string') {
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
              } catch (error) {
                // biome-ignore lint/suspicious/noConsole: this is fine
                console.error('Failed to parse JSON field:', error);
                data[key] = undefined;
              }
            } else if (key === 'removedGalleryIds') {
              try {
                data[key] = JSON.parse(value as string);
              } catch (error) {
                // biome-ignore lint/suspicious/noConsole: this is fine
                console.error('Failed to parse removed gallery IDs:', error);
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

          // Normalize optional category field
          if (!data.category && data.categoryId) {
            data.category = data.categoryId;
          }

          // Validate parsed data against schema
          const parsed = ProductApiEditSchema.safeParse(data);
          if (!parsed.success) {
            return Response.json(
              {
                error: 'Validation failed',
                details: parsed.error.flatten(),
              },
              { status: 400 },
            );
          }
          const v = parsed.data;

          // Validate SKU format if provided
          if (v.sku && !SkuService.isValidSku(v.sku)) {
            return Response.json(
              {
                error: 'Invalid SKU format. Expected pattern like CAT-PRD-001',
              },
              { status: 400 },
            );
          }

          // Check SKU uniqueness if changed
          if (v.sku && v.sku !== existing.sku) {
            const existingSku = await prisma.product.findUnique({
              where: { sku: v.sku },
              select: { id: true },
            });
            if (existingSku) {
              return Response.json(
                { error: `SKU "${v.sku}" is already in use` },
                { status: 409 },
              );
            }
          }

          // Map field names
          const categoryId = v.category || existing.categoryId;

          // Handle dimensions
          const dims = v.dimensions;
          let dimensionLength = existing.dimensionLength;
          let dimensionWidth = existing.dimensionWidth;
          let dimensionHeight = existing.dimensionHeight;
          let dimensionUnit = existing.dimensionUnit;

          if (dims && dims.length !== undefined) {
            dimensionLength = dims.length ?? existing.dimensionLength;
            dimensionWidth = dims.width ?? existing.dimensionWidth;
            dimensionHeight = dims.height ?? existing.dimensionHeight;
            dimensionUnit = dims.unit || existing.dimensionUnit;
          }

          // Generate slug if name changed
          const nameChanged = v.productName !== existing.productName;
          let slug = existing.slug;
          if (nameChanged) {
            const baseSlug = slugify(v.productName ?? '');
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

          // Handle image updates (all images stored in ProductImage[])
          const keepExistingImage = v.keepExistingImage === true;
          const productImages = data.productImages as File[] | undefined;
          const removedImageIds: string[] = v.removedGalleryIds || [];

          // Delete removed images
          if (removedImageIds.length > 0) {
            const removedImages = existing.images.filter((img) =>
              removedImageIds.includes(img.id),
            );
            for (const img of removedImages) {
              if (img.imagePublicId) {
                await DeleteImage(img.imagePublicId).catch(() => {});
              }
            }
            await prisma.productImage.deleteMany({
              where: { id: { in: removedImageIds }, productId },
            });
          }

          // Upload new product images
          const newImageData: Array<{
            imageUrl: string;
            imagePublicId: string;
            order: number;
          }> = [];

          if (productImages && productImages.length > 0) {
            for (let i = 0; i < productImages.length; i++) {
              const file = productImages[i];
              if (file instanceof File && file.size > 0) {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                  return Response.json(
                    { error: `Image ${i + 1} must be JPEG, PNG, or WEBP` },
                    { status: 400 },
                  );
                }

                const maxSize = 2_097_152;
                if (file.size > maxSize) {
                  return Response.json(
                    { error: `Image ${i + 1} size must not exceed 2MB` },
                    { status: 400 },
                  );
                }

                const result = await UploadImage(file, 'products');
                newImageData.push({
                  imageUrl: result.secure_url,
                  imagePublicId: result.public_id,
                  order: i,
                });
              }
            }

            // If not keeping existing, delete old Cloudinary images before Prisma update
            if (!keepExistingImage) {
              const imagesToKeep = existing.images.filter(
                (img) => !removedImageIds.includes(img.id),
              );
              for (const img of imagesToKeep) {
                if (img.imagePublicId) {
                  await DeleteImage(img.imagePublicId).catch(() => {});
                }
              }
            }
          }

          // Handle attributes update
          const attributes = v.attributes;
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
          const variants = v.variants;
          if (variants) {
            // Delete existing variants
            await prisma.productVariant.deleteMany({
              where: { productId },
            });

            // Create new variants
            const variantImages = data.variantImages as
              | Record<string, File>
              | undefined;
            for (const variant of variants) {
              const attrRecord = variant.attributes;
              let variantImageUrl: string | null = null;
              let variantImagePublicId: string | null = null;

              const vId = variant.id ?? '';
              const vImage = variantImages?.[vId];
              if (vImage instanceof File && vImage.size > 0) {
                const result = await UploadImage(vImage, 'products/variants');
                variantImageUrl = result.secure_url;
                variantImagePublicId = result.public_id;
              }

              await prisma.productVariant.create({
                data: {
                  productId,
                  name: variant.name,
                  sku: variant.sku,
                  price: variant.price || 0,
                  discountPrice: variant.discountPrice ?? null,
                  stock: variant.stock,
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
              productName: v.productName ?? existing.productName,
              slug,
              description: v.description ?? existing.description,
              categoryId,
              tags: v.tags ?? existing.tags,
              sku: v.sku ?? existing.sku,
              brand: v.brand ?? existing.brand,
              price: v.price ?? existing.price,
              discountPrice: v.discountPrice ?? existing.discountPrice,
              stock: v.stock ?? existing.stock,
              hasVariants: !!(variants && variants.length > 0),
              condition:
                (v.condition as
                  | 'NEW'
                  | 'USED'
                  | 'LIKE_NEW'
                  | 'EXCELLENT'
                  | 'GOOD'
                  | 'FAIR'
                  | 'POOR'
                  | 'FOR_PARTS') ?? existing.condition,
              conditionDescription:
                v.conditionDescription ?? existing.conditionDescription,
              weight: v.weight ?? existing.weight,
              weightUnit: v.weightUnit ?? existing.weightUnit,
              freeShipping: v.freeShipping ?? existing.freeShipping,
              dimensionLength,
              dimensionWidth,
              dimensionHeight,
              dimensionUnit,
              ...(newImageData.length > 0
                ? {
                    images: {
                      ...(!keepExistingImage ? { deleteMany: {} } : {}),
                      create: !keepExistingImage
                        ? newImageData
                        : newImageData.map((img, i) => ({
                            ...img,
                            order:
                              existing.images.filter(
                                (e) => !removedImageIds.includes(e.id),
                              ).length + i,
                          })),
                    },
                  }
                : {}),
              metaTitle: v.metaTitle ?? existing.metaTitle,
              metaDescription: v.metaDescription ?? existing.metaDescription,
              status:
                (v.status as
                  | 'DRAFT'
                  | 'PUBLISHED'
                  | 'REJECTED'
                  | 'ARCHIVED'
                  | 'OUT_OF_STOCK') ?? existing.status,
              featured: v.featured ?? existing.featured,
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
