"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Define schema for the slug check
const slugCheckSchema = z.object({
  shopSlug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug cannot exceed 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
});

export type SlugCheckResult = {
  success: boolean;
  message: string;
  isUnique?: boolean;
};

/**
 * Server action to check if a shop slug is unique
 */
export async function checkSlugUniqueness(
  prevState: SlugCheckResult | null,
  formData: FormData,
): Promise<SlugCheckResult> {
  // Get the slug from form data
  const shopSlug = formData.get("shopSlug") as string;

  try {
    // Validate the slug format using zod
    const validatedFields = slugCheckSchema.parse({ shopSlug });

    // Check if the slug exists in the database
    const existingShop = await db.shop.findUnique({
      where: {
        slug: validatedFields.shopSlug,
      },
      select: {
        id: true,
      },
    });

    if (existingShop) {
      return {
        success: false,
        message: `The slug "${shopSlug}" is already in use. Please choose another one.`,
        isUnique: false,
      };
    }

    // Slug is unique
    return {
      success: true,
      message: `The slug "${shopSlug}" is available!`,
      isUnique: true,
    };
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(", ");
      return {
        success: false,
        message: errorMessage,
      };
    }

    // Handle other errors
    console.error("Slug check error:", error);
    return {
      success: false,
      message: "An error occurred while checking the slug availability.",
    };
  }
}

/**
 * Server action to update a shop slug after confirming uniqueness
 */
export async function updateShopSlug(
  shopId: string,
  newSlug: string,
): Promise<SlugCheckResult> {
  try {
    // Validate the slug format
    const validatedFields = slugCheckSchema.parse({ shopSlug: newSlug });

    // Double-check that the slug is still unique
    const existingShop = await db.shop.findUnique({
      where: {
        slug: validatedFields.shopSlug,
      },
      select: {
        id: true,
      },
    });

    if (existingShop && existingShop.id !== shopId) {
      return {
        success: false,
        message: `The slug "${newSlug}" is already in use. Please choose another one.`,
        isUnique: false,
      };
    }

    // Update the shop slug
    await db.shop.update({
      where: {
        id: shopId,
      },
      data: {
        slug: validatedFields.shopSlug,
      },
    });

    // Revalidate the shop page to reflect changes
    revalidatePath(`/shop/${newSlug}`);

    return {
      success: true,
      message: `Shop slug successfully updated to "${newSlug}"`,
      isUnique: true,
    };
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((e) => e.message).join(", ");
      return {
        success: false,
        message: errorMessage,
      };
    }

    // Handle other errors
    console.error("Slug update error:", error);
    return {
      success: false,
      message: "An error occurred while updating the shop slug.",
    };
  }
}
