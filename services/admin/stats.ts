import { QEUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';

export function useAdminStats() {
  return useQuery({
    queryKey: [QEUERY_KEYS.ADMIN_STATS],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/admin/stats');
      return response.json();
    },
  });
}
export function useAdminChartData(period = '6months') {
  return useQuery({
    queryKey: ['admin-chart-data', period],
    queryFn: async () => {
      const response = await fetch(
        `/api/dashboard/admin/stats/charts?period=${period}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }
      return response.json();
    },
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
}
