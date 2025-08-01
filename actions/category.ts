'use server';

import slugify from 'slugify';
import { DeleteImage, UploadImage } from '@/features/cloudinary';
import { db } from '@/lib/db';

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
  currentId?: string,
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
    return { success: false, message: (err as Error).message };
  }
}

/**
 * Enhanced category update with slug validation and proper image handling
 */
export async function updateCategory(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const slug = formData.get('slug') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;
    const order = parseInt(formData.get('order') as string, 10) || 0;
    const featured = formData.get('featured') === 'true';
    const parentId =
      formData.get('parentId') === 'none'
        ? null
        : (formData.get('parentId') as string | null);
    const imageFile = formData.get('image') as File | null;

    if (!id || !name || !slug) {
      return {
        success: false,
        message: 'Category ID, name, and slug are required.',
      };
    }

    // Get existing category
    const existingCategory = await db.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return {
        success: false,
        message: 'Category not found.',
      };
    }

    // Format the slug
    const formattedSlug = formatSlug(slug);

    // Check slug uniqueness if it's different from the current one
    if (existingCategory.slug !== formattedSlug) {
      const slugCheck = await checkCategorySlugUniqueness(formattedSlug, id);
      if (!slugCheck.isUnique) {
        return {
          success: false,
          uniqueCheck: slugCheck,
          message:
            'This slug is already in use. Please choose a different one or select from the suggestions.',
        };
      }
    }

    // Handle image update
    let imageData = existingCategory.image; // Keep existing image by default

    if (imageFile && imageFile.size > 0) {
      // Upload new image
      const result = await UploadImage(imageFile, 'categories');
      imageData = {
        url: result.secure_url,
        publicId: result.public_id,
        alt: name,
      };

      // Delete old image if it exists
      if (existingCategory.image?.publicId) {
        await DeleteImage(existingCategory.image.publicId);
      }
    }

    // Update the category
    const updatedCategory = await db.category.update({
      where: { id },
      data: {
        name,
        slug: formattedSlug,
        description: description || null,
        featured,
        order,
        parentId: parentId || null,
        image: imageData,
      },
    });

    return {
      success: true,
      category: updatedCategory,
      message: 'Category updated successfully.',
    };
    // biome-ignore lint: error
  } catch (error) {
    return {
      success: false,
      message: 'An unexpected error occurred while updating the category.',
    };
  }
}

/**
 * Check if a category can be safely deleted
 * Returns information about dependencies that need to be handled
 */
export async function checkCategoryDeletionSafety(id: string) {
  try {
    if (!id) {
      return {
        canDelete: false,
        message: 'Category ID is required.',
        dependencies: {},
      };
    }

    // Check if category exists
    const category = await db.category.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    });

    if (!category) {
      return {
        canDelete: false,
        message: 'Category not found.',
        dependencies: {},
      };
    }

    // Check for subcategories
    const subcategoriesCount = await db.category.count({
      where: { parentId: id },
    });

    // Check for associated products (assuming you have a products table)
    // Adjust this based on your actual schema
    let productsCount = 0;
    try {
      productsCount =
        (await db.product?.count({
          where: { categoryId: id },
        })) || 0;
    } catch {
      // If product table doesn't exist or has different structure, ignore
    }

    const dependencies = {
      subcategories: subcategoriesCount,
      products: productsCount,
    };

    const totalDependencies = subcategoriesCount + productsCount;

    return {
      canDelete: totalDependencies === 0,
      category,
      dependencies,
      message:
        totalDependencies > 0
          ? 'This category has associated content that must be handled before deletion.'
          : 'Category can be safely deleted.',
    };
  } catch (error) {
    return {
      canDelete: false,
      message: 'Error checking category dependencies.',
      dependencies: {},
      error: (error as Error).message,
    };
  }
}

/**
 * Delete a category with proper validation and cleanup
 * Includes options for handling dependencies
 */
export async function deleteCategory(
  id: string,
  options: {
    force?: boolean; // Force delete even with dependencies
    reassignSubcategories?: string | null; // New parent for subcategories
    reassignProducts?: string | null; // New category for products
    reassignPosts?: string | null; // New category for posts
  } = {},
) {
  try {
    if (!id) {
      return {
        success: false,
        message: 'Category ID is required.',
      };
    }

    // Get category with image info for cleanup
    const category = await db.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
      },
    });

    if (!category) {
      return {
        success: false,
        message: 'Category not found.',
      };
    }

    // Check deletion safety unless force is true
    if (!options.force) {
      const safetyCheck = await checkCategoryDeletionSafety(id);
      if (!safetyCheck.canDelete) {
        return {
          success: false,
          message: safetyCheck.message,
          dependencies: safetyCheck.dependencies,
          requiresForce: true,
        };
      }
    }

    // Begin transaction for safe deletion
    const result = await db.$transaction(async (tx) => {
      // Handle subcategories
      if (options.reassignSubcategories !== undefined) {
        await tx.category.updateMany({
          where: { parentId: id },
          data: { parentId: options.reassignSubcategories },
        });
      } else if (options.force) {
        // If force delete, remove parent relationship
        await tx.category.updateMany({
          where: { parentId: id },
          data: { parentId: null },
        });
      }

      // Handle products (adjust based on your schema)
      try {
        if (options.reassignProducts !== undefined) {
          await tx.product?.updateMany({
            where: { categoryId: id },
            data: {
              categoryId: options.reassignProducts || undefined,
            },
          });
        } else if (options.force) {
          await tx.product?.updateMany({
            where: { categoryId: id },
            data: { categoryId: undefined },
          });
        }
      } catch {
        // Ignore if product table doesn't exist
      }

      // Delete the category
      const deletedCategory = await tx.category.delete({
        where: { id },
      });

      return deletedCategory;
    });

    // Clean up associated image after successful deletion
    if (category.image?.publicId) {
      await DeleteImage(category.image.publicId);
    }

    return {
      success: true,
      message: `Category "${category.name}" has been successfully deleted.`,
      deletedCategory: result,
    };
  } catch (error) {
    return {
      success: false,
      message: 'An unexpected error occurred while deleting the category.',
      error: (error as Error).message,
    };
  }
}

/**
 * Simplified delete function for basic use cases
 */
export async function deleteCategorySimple(id: string) {
  return deleteCategory(id, { force: false });
}
