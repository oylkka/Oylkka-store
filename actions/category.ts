'use server';

import { UploadImage } from '@/features/cloudinary';
import { db } from '@/lib/db';
import slugify from 'slugify';

/**
 * Ensures a string is a valid slug format using slugify
 */
function formatSlug(input: string): string {
  if (!input) return '';

  return slugify(input, {
    lower: true, // Convert to lowercase
    strict: true, // Strip special characters
    trim: true, // Trim leading/trailing spaces
  });
}

/**
 * Check if a slug is unique in the database
 * If not, suggest alternatives by appending numbers
 */
export async function checkCategorySlugUniqueness(
  slug: string,
  currentId?: string
) {
  try {
    // Basic validation
    if (!slug) {
      return {
        isUnique: false,
        slug: '',
        suggestions: [],
        error: 'Slug cannot be empty',
      };
    }

    // Sanitize and format the slug
    const formattedSlug = formatSlug(slug);

    // Check if slug exists (excluding the current category if updating)
    const existingCategory = await db.category.findFirst({
      where: {
        slug: formattedSlug,
        ...(currentId ? { id: { not: currentId } } : {}),
      },
    });

    // If slug is unique, return it
    if (!existingCategory) {
      return {
        isUnique: true,
        slug: formattedSlug,
        suggestions: [],
      };
    }

    // If slug is not unique, generate intelligent alternatives
    const suggestions: string[] = [];

    // Try adding sequential numbers
    for (let i = 1; i <= 3; i++) {
      const suggestedSlug = `${formattedSlug}-${i}`;
      const exists = await db.category.findFirst({
        where: {
          slug: suggestedSlug,
          ...(currentId ? { id: { not: currentId } } : {}),
        },
      });

      if (!exists) {
        suggestions.push(suggestedSlug);
      }
    }

    // Try adding random suffixes if we still need more suggestions
    if (suggestions.length < 3) {
      for (let i = 0; i < 3 - suggestions.length; i++) {
        // Generate a random 3-character alphanumeric suffix
        const randomSuffix = Math.random().toString(36).substring(2, 5);
        const suggestedSlug = `${formattedSlug}-${randomSuffix}`;

        const exists = await db.category.findFirst({
          where: {
            slug: suggestedSlug,
            ...(currentId ? { id: { not: currentId } } : {}),
          },
        });

        if (!exists) {
          suggestions.push(suggestedSlug);
        }
      }
    }

    return {
      isUnique: false,
      slug: formattedSlug,
      suggestions,
    };
  } catch (error) {
    console.error('Error checking slug uniqueness:', error);
    return {
      isUnique: false,
      slug: '',
      suggestions: [],
      error: (error as Error).message,
    };
  }
}

/**
 * Enhanced category creation with slug validation and uniqueness check
 */
export async function createCategory(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string | null;
    const order = parseInt(formData.get('order') as string, 10) || 0;
    const featured = formData.get('featured') === 'true';
    const parentId =
      formData.get('parentId') === 'none'
        ? null
        : (formData.get('parentId') as string | null);
    const imageFile = formData.get('image') as File | null;

    if (!name || !slug) {
      throw new Error('Name and slug are required.');
    }

    // Format and validate slug
    const formattedSlug = formatSlug(slug);

    // Check slug uniqueness before proceeding
    const slugCheck = await checkCategorySlugUniqueness(formattedSlug);
    if (!slugCheck.isUnique) {
      return {
        success: false,
        uniqueCheck: slugCheck,
        message:
          'This slug is already in use. Please choose a different one or select from the suggestions.',
      };
    }

    // Process image upload if provided
    let imageData = null;
    if (imageFile && imageFile.size > 0) {
      const result = await UploadImage(imageFile, 'categories');
      imageData = {
        url: result.secure_url,
        publicId: result.public_id,
        alt: name,
      };
    }

    // Create the category with the verified unique slug
    const newCategory = await db.category.create({
      data: {
        name,
        slug: slugCheck.slug, // Using the validated slug
        description: description || null,
        featured,
        order,
        parentId: parentId || null,
        image: imageData || undefined,
      },
    });

    return { success: true, category: newCategory };
  } catch (err) {
    console.error('❌ Error creating category:', err);
    return { success: false, message: (err as Error).message };
  }
}
