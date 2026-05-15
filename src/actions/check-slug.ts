import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { prisma } from '@/lib/db';

const CheckSlugSchema = z.object({
  slug: z.string().min(1),
  productId: z.string().optional(),
});

export const checkSlugUnique = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => CheckSlugSchema.parse(data))
  .handler(async ({ data }) => {
    const { slug, productId } = data;

    const existing = await prisma.product.findFirst({
      where: {
        slug,
        ...(productId ? { NOT: { id: productId } } : {}),
      },
      select: { id: true },
    });

    const isUnique = !existing;

    const suggestions: string[] = [];
    if (!isUnique) {
      const baseSlug = slug.replace(/-\d+$/, '');
      for (let i = 1; i <= 5; i++) {
        const candidate = `${baseSlug}-${i}`;
        const taken = await prisma.product.findFirst({
          where: { slug: candidate },
          select: { id: true },
        });
        if (!taken) {
          suggestions.push(candidate);
        }
      }
    }

    return { isUnique, suggestions };
  });
