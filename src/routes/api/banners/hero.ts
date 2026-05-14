import { createFileRoute } from '@tanstack/react-router';
import { isAfter, isBefore, isEqual } from 'date-fns';
import { prisma } from '@/lib/db';

export const Route = createFileRoute('/api/banners/hero')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const currentDate = new Date();

          const banners = await prisma.banner.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            include: { image: true },
          });

          const filteredBanners = banners.filter((banner) => {
            if (!banner.startDate && !banner.endDate) return true;

            if (banner.startDate && !banner.endDate) {
              const startDate = new Date(banner.startDate);
              return (
                isAfter(currentDate, startDate) ||
                isEqual(currentDate, startDate)
              );
            }

            if (!banner.startDate && banner.endDate) {
              const endDate = new Date(banner.endDate);
              return (
                isBefore(currentDate, endDate) || isEqual(currentDate, endDate)
              );
            }

            if (banner.startDate && banner.endDate) {
              const startDate = new Date(banner.startDate);
              const endDate = new Date(banner.endDate);
              return (
                (isAfter(currentDate, startDate) ||
                  isEqual(currentDate, startDate)) &&
                (isBefore(currentDate, endDate) ||
                  isEqual(currentDate, endDate))
              );
            }

            return false;
          });

          return Response.json(filteredBanners, { status: 200 });
        } catch {
          return Response.json(
            { error: 'Internal Server Error' },
            { status: 500 },
          );
        }
      },
    },
  },
});
