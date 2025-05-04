'use server';
import { db } from '@/lib/db';

type SlugCheckResult = {
  isUnique: boolean;
  suggestions: string[];
};

export async function checkSlugUnique(slug: string): Promise<SlugCheckResult> {
  // Enhanced logging

  if (!slug) {
    console.log('Server: Empty slug received, returning not unique');
    return { isUnique: false, suggestions: [] };
  }

  try {
    // First check if the original slug exists
    console.log(`Server: Looking for existing slug "${slug}"`);
    const existing = await db.product.findUnique({ where: { slug } });

    if (!existing) {
      console.log('Server: Slug is unique!');
      return { isUnique: true, suggestions: [] };
    }

    console.log('Server: Slug is taken, generating alternatives...');

    // Generate potential alternative slugs
    const potentialSlugs = Array.from(
      { length: 5 },
      (_, i) => `${slug}-${i + 1}`
    );

    console.log(`Server: Checking alternatives: ${potentialSlugs.join(', ')}`);

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

    console.log(`Server: Found ${existingSlugs.length} existing alternatives`);

    // Create a set of existing slugs for faster lookup
    const existingSlugSet = new Set(existingSlugs.map((item) => item.slug));

    // Filter out suggestions that already exist
    const suggestions = potentialSlugs.filter(
      (suggestedSlug) => !existingSlugSet.has(suggestedSlug)
    );

    console.log(
      `Server: Returning ${suggestions.length} suggestions: ${suggestions.join(', ')}`
    );

    return {
      isUnique: false,
      suggestions,
    };
  } catch (error) {
    console.error('Server: Error checking slug uniqueness:', error);
    return {
      isUnique: false,
      suggestions: [],
    };
  }
}
