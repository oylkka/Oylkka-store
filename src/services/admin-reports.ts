import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

type ProductReport = {
  id: string;
  productId: string;
  userId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  product: { id: string; productName: string; slug: string };
  user: { id: string; name: string; email: string };
};

export function useAdminReports(status?: string) {
  return useQuery<{ reports: ProductReport[] }>({
    queryKey: [QUERY_KEYS.ADMIN_REPORTS, status],
    queryFn: async () => {
      const params = status ? `?status=${status}` : '';
      const r = await apiClient.get<{ reports: ProductReport[] }>(
        `/api/admin/reports/list${params}`,
      );
      return r.data;
    },
  });
}
