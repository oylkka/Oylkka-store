'use server';
import { db } from '@/lib/db';

type SlugCheckResult = {
  isUnique: boolean;
  suggestions: string[];
};

export async function checkSlugUnique(slug: string): Promise<SlugCheckResult> {
  // Enhanced logging

  if (!slug) {
    return { isUnique: false, suggestions: [] };
  }

  try {
    const existing = await db.product.findUnique({ where: { slug } });

    if (!existing) {
      return { isUnique: true, suggestions: [] };
    }

    // Generate potential alternative slugs
    const potentialSlugs = Array.from(
      { length: 5 },
      (_, i) => `${slug}-${i + 1}`,
    );

    // Check all potential slugs in a single query
    const existingSlugs = await db.product.findMany({
      where: {
        slug: {
          in: potentialSlugs,
        },
      },
      select: {
        slug: true,
      },
    });

    // Create a set of existing slugs for faster lookup
    const existingSlugSet = new Set(existingSlugs.map((item) => item.slug));

    // Filter out suggestions that already exist
    const suggestions = potentialSlugs.filter(
      (suggestedSlug) => !existingSlugSet.has(suggestedSlug),
    );

    return {
      isUnique: false,
      suggestions,
    };
    // biome-ignore lint: error
  } catch (error) {
    return {
      isUnique: false,
      suggestions: [],
    };
  }
}
