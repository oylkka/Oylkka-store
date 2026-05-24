import { createFileRoute } from '@tanstack/react-router';
import { DeleteImage, UploadImage } from '@/cloudinary';
import { requireAdmin, requireAuth } from '@/lib/auth-middleware';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/slug';
import { CategoryApiSchema } from '@/schemas/category-schema';

export const Route = createFileRoute('/api/categories/edit')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authResult = await requireAuth();
          if (authResult.response) return authResult.response;
          const roleResponse = requireAdmin(authResult.session);
          if (roleResponse) return roleResponse;

          const csrfResponse = validateCsrf();
          if (csrfResponse) return csrfResponse;

          const formData = await request.formData();

          // biome-ignore lint: error
          const data: Record<string, any> = {};
          for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
              data[key] = value;
            } else if (key === 'featured') {
              data[key] = value === 'true';
            } else if (key === 'order') {
              data[key] = value ? Number(value) : 0;
            } else {
              data[key] = value;
            }
          }

          const id = data.id as string;
          if (!id) {
            return Response.json(
              { error: 'Category ID is required' },
              { status: 400 },
            );
          }

          const existingCategory = await prisma.category.findUnique({
            where: { id },
          });
          if (!existingCategory) {
            return Response.json(
              { error: 'Category not found' },
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

          const parsed = CategoryApiSchema.safeParse(textFields);
          if (!parsed.success) {
            return Response.json(
              {
                error: 'Validation failed',
                details: parsed.error.flatten(),
              },
              { status: 400 },
            );
          }

          let slug = existingCategory.slug;
          if (parsed.data.name !== existingCategory.name) {
            const baseSlug = slugify(parsed.data.name);
            if (!baseSlug) {
              return Response.json(
                {
                  error: 'Invalid category name — unable to generate slug',
                },
                { status: 400 },
              );
            }

            slug = baseSlug;
            let counter = 1;
            while (
              await prisma.category.findUnique({
                where: { slug },
              })
            ) {
              if (slug === existingCategory.slug) break;
              slug = `${baseSlug}-${counter}`;
              counter++;
            }
          }

          let imageUrl = existingCategory.imageUrl;
          let imagePublicId = existingCategory.imagePublicId;

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

            if (existingCategory.imagePublicId) {
              await DeleteImage(existingCategory.imagePublicId);
            }

            const result = await UploadImage(imageFile, 'categories');
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
          }

          const category = await prisma.category.update({
            where: { id },
            data: {
              name: parsed.data.name,
              slug,
              description: parsed.data.description || null,
              parentId: parsed.data.parentId || null,
              featured: parsed.data.featured,
              order: parsed.data.order,
              imageUrl,
              imagePublicId,
            },
          });

          return Response.json(
            { message: 'Category updated successfully', category },
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
