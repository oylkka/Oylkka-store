import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { UploadImage } from '@/cloudinary';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/slug';

export const Route = createFileRoute('/api/product/create')({
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
              { error: 'You need an active shop to create products' },
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
              key === 'featured'
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
            } else if (key === 'tags') {
              if (!data.tags) data.tags = [];
              (data.tags as string[]).push(value as string);
            } else {
              data[key] = value;
            }
          }

          // Handle backward compatibility: old format sends image + gallery
          if (!data.productImages && data.image) {
            data.productImages = [data.image];
          }
          if (!data.productImages && data.gallery) {
            data.productImages = [
              ...((data.productImages as File[]) || []),
              ...(data.gallery as File[]),
            ];
          }

          // Map field names (handle both old and new formats)
          const categoryId =
            (data.category as string) || (data.categoryId as string) || '';

          const textFields: Record<string, unknown> = {
            productName: data.productName as string,
            description: data.description as string,
            categoryId,
            slug: data.slug as string,
            sku: data.sku as string,
            brand: (data.brand as string) || null,
            price: data.price as number,
            discountPrice: (data.discountPrice as number) || null,
            stock: (data.stock as number) || 0,
            lowStockAlert: (data.lowStockAlert as number) || 5,
            condition: (data.condition as string) || 'NEW',
            conditionDescription: (data.conditionDescription as string) || null,
            weight: (data.weight as number) || null,
            weightUnit: (data.weightUnit as string) || 'kg',
            freeShipping:
              data.freeShipping === true || data.freeShipping === 'true',
            metaTitle: (data.metaTitle as string) || null,
            metaDescription: (data.metaDescription as string) || null,
            status: (data.status as string) || 'DRAFT',
            featured: data.featured === true || data.featured === 'true',
          };

          // Handle dimensions (nested JSON or flat)
          const dims = data.dimensions as Record<string, unknown> | undefined;
          if (dims) {
            textFields.dimensionLength = (dims.length as number) || null;
            textFields.dimensionWidth = (dims.width as number) || null;
            textFields.dimensionHeight = (dims.height as number) || null;
            textFields.dimensionUnit = (dims.unit as string) || 'cm';
          } else {
            textFields.dimensionLength =
              (data.dimensionLength as number) || null;
            textFields.dimensionWidth = (data.dimensionWidth as number) || null;
            textFields.dimensionHeight =
              (data.dimensionHeight as number) || null;
            textFields.dimensionUnit = (data.dimensionUnit as string) || 'cm';
          }

          // Generate slug from product name if not provided
          const baseSlug = textFields.slug
            ? slugify(textFields.slug as string)
            : slugify(textFields.productName as string);

          if (!baseSlug) {
            return Response.json(
              { error: 'Invalid product name — unable to generate slug' },
              { status: 400 },
            );
          }

          let slug = baseSlug;
          let counter = 1;
          while (await prisma.product.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
          }

          // Upload main product images
          const productImageFiles = data.productImages as File[] | undefined;
          const imageData: Array<{
            imageUrl: string;
            imagePublicId: string;
            order: number;
          }> = [];

          if (productImageFiles && productImageFiles.length > 0) {
            for (let i = 0; i < productImageFiles.length; i++) {
              const file = productImageFiles[i];
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

                const folder = i === 0 ? 'products' : 'products/gallery';
                const result = await UploadImage(file, folder);
                imageData.push({
                  imageUrl: result.secure_url,
                  imagePublicId: result.public_id,
                  order: i,
                });
              }
            }
          }

          // Parse attributes and variants
          const attributes = data.attributes as
            | Record<string, string[]>
            | undefined;
          const variants = data.variants as
            | Array<Record<string, unknown>>
            | undefined;

          // Handle variant images
          const variantImages = data.variantImages as
            | Record<string, File>
            | undefined;

          const product = await prisma.product.create({
            data: {
              productName: textFields.productName as string,
              slug,
              description: textFields.description as string,
              categoryId: textFields.categoryId as string,
              tags: (data.tags as string[]) || [],
              sku: textFields.sku as string,
              brand: textFields.brand as string | null,
              price: textFields.price as number,
              discountPrice: textFields.discountPrice as number | null,
              stock: textFields.stock as number,
              hasVariants: !!(variants && variants.length > 0),
              condition: textFields.condition as
                | 'NEW'
                | 'USED'
                | 'LIKE_NEW'
                | 'EXCELLENT'
                | 'GOOD'
                | 'FAIR'
                | 'POOR'
                | 'FOR_PARTS',
              conditionDescription: textFields.conditionDescription as
                | string
                | null,
              weight: textFields.weight as number | null,
              weightUnit: textFields.weightUnit as string,
              freeShipping: textFields.freeShipping as boolean,
              dimensionLength: textFields.dimensionLength as number | null,
              dimensionWidth: textFields.dimensionWidth as number | null,
              dimensionHeight: textFields.dimensionHeight as number | null,
              dimensionUnit: textFields.dimensionUnit as string,
              imageUrl: imageData[0]?.imageUrl || null,
              imagePublicId: imageData[0]?.imagePublicId || null,
              images:
                imageData.length > 1
                  ? {
                      create: imageData.slice(1).map((img) => ({
                        imageUrl: img.imageUrl,
                        imagePublicId: img.imagePublicId,
                        order: img.order - 1,
                      })),
                    }
                  : undefined,
              metaTitle: textFields.metaTitle as string | null,
              metaDescription: textFields.metaDescription as string | null,
              status: textFields.status as
                | 'DRAFT'
                | 'ACTIVE'
                | 'ARCHIVED'
                | 'OUT_OF_STOCK',
              featured: textFields.featured as boolean,
              shopId: shop.id,
              createdBy: session.user.id,

              // Create attribute options
              ...(attributes && Object.keys(attributes).length > 0
                ? {
                    attributeOptions: {
                      create: Object.entries(attributes).map(
                        ([name, values]) => ({
                          name,
                          values: Array.isArray(values)
                            ? values
                            : [values as string],
                        }),
                      ),
                    },
                  }
                : {}),

              // Create variants
              ...(variants && variants.length > 0
                ? {
                    variants: {
                      create: await Promise.all(
                        variants.map(async (v) => {
                          const attrRecord =
                            (v.attributes as Record<string, string>) || {};

                          let variantImageUrl: string | null = null;
                          let variantImagePublicId: string | null = null;

                          const vId = v.id as string;
                          const vImage = variantImages?.[vId];
                          if (vImage instanceof File && vImage.size > 0) {
                            const result = await UploadImage(
                              vImage,
                              'products/variants',
                            );
                            variantImageUrl = result.secure_url;
                            variantImagePublicId = result.public_id;
                          }

                          return {
                            name: v.name as string,
                            sku: v.sku as string,
                            price: (v.price as number) || 0,
                            discountPrice: (v.discountPrice as number) || null,
                            stock: (v.stock as number) || 0,
                            attributes: attrRecord,
                            imageUrl: variantImageUrl,
                            imagePublicId: variantImagePublicId,
                          };
                        }),
                      ),
                    },
                  }
                : {}),
            },
            include: {
              images: { orderBy: { order: 'asc' } },
              category: true,
              variants: true,
              attributeOptions: true,
            },
          });

          return Response.json(
            { message: 'Product created successfully', product },
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
