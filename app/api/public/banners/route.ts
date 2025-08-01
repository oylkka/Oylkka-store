import { isAfter, isBefore, isEqual } from 'date-fns';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

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
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
