import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { UploadImage } from '@/cloudinary';
import { auth } from '@/lib/auth';
import { validateCsrf } from '@/lib/csrf';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/slug';
import { CategoryApiSchema } from '@/schemas/category-schema';

export const Route = createFileRoute('/api/categories/add')({
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
            } else if (key === 'featured') {
              data[key] = value === 'true';
            } else if (key === 'order') {
              data[key] = value ? Number(value) : 0;
            } else {
              data[key] = value;
            }
          }

          const textFields = { ...data };
          delete textFields.image;

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

          const baseSlug = slugify(parsed.data.name);
          if (!baseSlug) {
            return Response.json(
              { error: 'Invalid category name — unable to generate slug' },
              { status: 400 },
            );
          }

          let slug = baseSlug;
          let counter = 1;
          while (await prisma.category.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
          }

          let imageUrl: string | null = null;
          let imagePublicId: string | null = null;

          const imageFile = data.image;
          if (imageFile instanceof File && imageFile.size > 0) {
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

            const result = await UploadImage(imageFile, 'categories');
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
          }

          const category = await prisma.category.create({
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
            { message: 'Category created successfully', category },
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
