import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

export type VendorAnalytics = {
  stats: {
    revenue: number;
    commission: number;
    totalOrders: number;
    fulfilledOrders: number;
    pendingOrders: number;
    products: number;
  };
  monthlyRevenue: { month: string; amount: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    productName: string;
    quantity: number;
    total: number;
    status: string;
    createdAt: string;
  }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
};

export function useVendorAnalytics() {
  return useQuery<VendorAnalytics>({
    queryKey: [QUERY_KEYS.VENDOR_ANALYTICS],
    queryFn: async () => {
      const r = await apiClient.get<VendorAnalytics>(
        '/api/vendor/analytics/overview',
      );
      return r.data;
    },
  });
}
