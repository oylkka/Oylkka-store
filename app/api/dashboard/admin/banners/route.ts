import { isAfter, isBefore, isEqual } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';

import { UploadImage } from '@/features/cloudinary';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        data[key] = value;
      } else if (key === 'startDate' || key === 'endDate') {
        data[key] = value ? new Date(value as string) : null;
      } else {
        data[key] = value;
      }
    }

    // Upload image
    let imageData = null;
    const imageFile = data.image;

    if (imageFile instanceof File && imageFile.size > 0) {
      const result = await UploadImage(imageFile, 'banners');
      imageData = {
        url: result.secure_url,
        publicId: result.public_id,
        alt: data.title || 'Banner Image',
      };
    }

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image upload failed or missing' },
        { status: 400 }
      );
    }

    const banner = await db.banner.create({
      data: {
        title: data.title,
        subTitle: data.subtitle || null,
        description: data.description || null,
        bannerTag: data.bannerTag || null,
        alignment: data.alignment || 'center',
        primaryActionText: data.primaryActionText || null,
        primaryActionLink: data.primaryActionLink || null,
        secondaryActionText: data.secondaryActionText || null,
        secondaryActionLink: data.secondaryActionLink || null,
        bannerPosition: data.bannerPosition || 'home_top',
        startDate: data.startDate,
        endDate: data.endDate,
        image: imageData,
      },
    });

    return NextResponse.json(
      { message: 'Banner created successfully', banner },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error handling banner submission:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const currentDate = new Date();

    // Fetch all active banners
    const banners = await db.banner.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        image: true,
      },
    });

    // Filter banners based on date conditions with proper null handling
    const filteredBanners = banners.filter((banner) => {
      // Case 1: No dates set - always show
      if (!banner.startDate && !banner.endDate) {
        return true;
      }

      // Case 2: Only start date - show if current date is after or equal to start date
      if (banner.startDate && !banner.endDate) {
        // Convert from nullable to non-nullable before passing to date-fns
        const startDate = new Date(banner.startDate);
        return (
          isAfter(currentDate, startDate) || isEqual(currentDate, startDate)
        );
      }

      // Case 3: Only end date - show if current date is before or equal to end date
      if (!banner.startDate && banner.endDate) {
        // Convert from nullable to non-nullable before passing to date-fns
        const endDate = new Date(banner.endDate);
        return isBefore(currentDate, endDate) || isEqual(currentDate, endDate);
      }

      // Case 4: Both dates - show if current date is between start and end (inclusive)
      if (banner.startDate && banner.endDate) {
        // Convert from nullable to non-nullable before passing to date-fns
        const startDate = new Date(banner.startDate);
        const endDate = new Date(banner.endDate);

        return (
          (isAfter(currentDate, startDate) ||
            isEqual(currentDate, startDate)) &&
          (isBefore(currentDate, endDate) || isEqual(currentDate, endDate))
        );
      }

      // Default fallback (shouldn't reach here but TypeScript needs it)
      return false;
    });

    return NextResponse.json(filteredBanners, { status: 200 });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
