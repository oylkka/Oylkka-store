import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { DeleteImage, UploadImage } from '@/features/cloudinary';
import { db } from '@/lib/db';
import type { Prisma } from '@/prisma/output';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json('Not Found', { status: 404 });
  }

  try {
    const banner = await db.banner.findUnique({
      where: {
        id: id,
      },
      include: {
        image: true,
      },
    });
    return NextResponse.json(banner, { status: 200 });
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    // biome-ignore lint: error
    const data: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        data[key] = value;
      } else if (key === 'startDate' || key === 'endDate') {
        data[key] = value ? new Date(value as string) : null;
      } else if (key === 'isActive') {
        data[key] = value === 'true'; // Convert 'true'/'false' strings to boolean
      } else {
        data[key] = value;
      }
    }

    if (!data.id || typeof data.id !== 'string') {
      return NextResponse.json(
        { error: 'Banner ID is required and must be a string' },
        { status: 400 },
      );
    }

    const bannerId = data.id as string;

    const banner = await db.banner.findUnique({
      where: { id: bannerId },
    });

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    const updatePayload: Prisma.BannerUpdateInput = {};

    // --- Image Handling Logic ---
    const imageFile = data.image instanceof File ? data.image : null;
    const altText = data.altText as string | undefined; // Assuming 'altText' might come in formData for the image alt

    if (data.keepExistingImage === 'true') {
      // If keeping the image, only update its alt text if 'altText' is provided
      if (altText !== undefined && banner.image) {
        updatePayload.image = {
          // Using Prisma's update structure for embedded types
          update: {
            alt: altText,
          },
        };
      }
    } else {
      // keepExistingImage is 'false', undefined, or any other value (interpreted as not explicitly keeping)
      if (imageFile) {
        // New image is provided, and we are not explicitly keeping the old one.
        // This implies replacement.

        if (banner?.image.publicId) {
          await DeleteImage(banner.image.publicId);
        }
        try {
          // Assuming 'banners' is the desired folder in Cloudinary
          const uploadedImage = await UploadImage(imageFile, 'banners');
          updatePayload.image = {
            // For embedded types, Prisma expects the full object on replacement
            url: uploadedImage.secure_url,
            publicId: uploadedImage.public_id,
            alt: altText !== undefined ? altText : '', // Use new alt text or default to empty
          };
          // biome-ignore lint: error
        } catch (uploadError) {
          return NextResponse.json(
            { error: 'Image upload failed' },
            { status: 500 },
          );
        }
      } else {
        // No new image file, and keepExistingImage is not 'true'.
        // Check if keepExistingImage was explicitly 'false', implying removal.
        if (
          data.keepExistingImage === 'false' &&
          banner.image &&
          banner.image.publicId
        ) {
          try {
            await DeleteImage(banner.image.publicId);
            // Set image fields to empty, as 'Image' type itself is not nullable in Banner
            updatePayload.image = {
              url: '',
              publicId: '',
              alt: '',
            };
            // biome-ignore lint: error
          } catch (deleteError) {
            return NextResponse.json(
              { error: 'Failed to remove existing image' },
              { status: 500 },
            );
          }
        } else if (
          altText !== undefined &&
          banner.image &&
          !updatePayload.image
        ) {
          // If keepExistingImage was undefined (not 'true' or 'false'), and no new image,
          // but altText is provided, update altText of the existing image.

          updatePayload.image = {
            update: {
              alt: altText,
            },
          };
        }
      }
    }

    // --- Populate other fields for update ---
    const allowedFields: Array<
      Exclude<
        keyof Prisma.BannerUpdateInput,
        'image' | 'id' | 'createdAt' | 'updatedAt'
      >
    > = [
      'title',
      'subTitle',
      'description',
      'bannerTag',
      'alignment',
      'primaryActionText',
      'primaryActionLink',
      'secondaryActionText',
      'secondaryActionLink',
      'bannerPosition',
      'isActive',
      'startDate',
      'endDate',
    ];

    for (const key of allowedFields) {
      if (Object.hasOwn(data, key)) {
        // Ensure data[key] is not undefined before assigning
        if (data[key] !== undefined) {
          // Prisma expects dates or null for DateTime? fields
          if (
            (key === 'startDate' || key === 'endDate') &&
            data[key] === null
          ) {
            // biome-ignore lint: error
            (updatePayload as any)[key] = null;
          } else {
            // biome-ignore lint: error
            (updatePayload as any)[key] = data[key];
          }
        }
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { message: 'No updatable fields provided.' },
        { status: 200 },
      ); // Or 400 if no change is an error
    }

    const updatedBanner = await db.banner.update({
      where: {
        id: bannerId,
      },
      data: updatePayload,
    });

    return NextResponse.json(updatedBanner, { status: 200 });
  } catch (error) {
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // 1. Authentication check
    const session = await auth();
    if (
      !session ||
      !session.user ||
      !session.user.role ||
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        {
          message: 'Unauthorized',
          error: 'You are not authorized to delete banners',
        },
        { status: 401 },
      );
    }

    // 2. Parse and validate query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Not Found', error: 'Banner not found' },
        { status: 404 },
      );
    }

    // 3. Fetch the banner
    const banner = await db.banner.findUnique({
      where: { id },
      select: {
        id: true,
        title: true, // Include for logging
        image: {
          select: {
            publicId: true,
          },
        },
      },
    });

    if (!banner) {
      return NextResponse.json(
        { message: 'Not Found', error: 'Banner not found' },
        { status: 404 },
      );
    }

    // 4. Perform deletion in a transaction
    await db.$transaction(async (tx) => {
      // Delete the image if publicId exists
      if (banner.image?.publicId) {
        try {
          await DeleteImage(banner.image.publicId);
          // biome-ignore lint: error
        } catch (imageError) {
          throw new Error('Failed to delete associated image');
        }
      }

      // Delete the banner
      await tx.banner.delete({
        where: { id },
      });
    });

    return NextResponse.json(
      { message: 'Banner deleted successfully', data: { id } },
      { status: 200 },
    );
  } catch (error) {
    // 6. Handle and log errors
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error';

    return NextResponse.json(
      {
        message: 'Internal Server Error',
        error:
          errorMessage === 'Failed to delete associated image'
            ? 'Failed to delete associated image'
            : 'An unexpected error occurred',
      },
      { status: 500 },
    );
  }
}
