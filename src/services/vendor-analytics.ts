import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

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
    queryKey: ['vendor-analytics'],
    queryFn: async () => {
      const r = await apiClient.get<VendorAnalytics>(
        '/api/vendor/analytics/overview',
      );
      return r.data;
    },
  });
}
