import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

export type DashboardStats = {
  revenue: number;
  orders: number;
  pendingOrders: number;
  processingOrders: number;
  products: number;
  users: number;
  vendors: number;
};

export type DailyRevenue = {
  date: string;
  amount: number;
};

export type RecentOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
};

type DashboardResponse = {
  stats: DashboardStats;
  dailyRevenue: DailyRevenue[];
  recentOrders: RecentOrder[];
};

export function useAdminDashboardStats() {
  return useQuery<DashboardResponse>({
    queryKey: [QUERY_KEYS.ADMIN_DASHBOARD],
    queryFn: async () => {
      const r = await apiClient.get<DashboardResponse>(
        '/api/admin/dashboard/stats',
      );
      return r.data;
    },
  });
}
