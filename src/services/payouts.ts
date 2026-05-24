import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

type PayoutItem = {
  id: string;
  shopId: string;
  amount: number;
  currency: string;
  status: string;
  reference: string | null;
  note: string | null;
  processedAt: string | null;
  processedBy: string | null;
  createdAt: string;
  updatedAt: string;
  shop?: { id: string; name: string };
  _count?: { items: number };
};

type PendingShop = {
  shopId: string;
  shopName: string;
  commissionRate: number;
  pendingItems: number;
  totalAmount: number;
};

// Admin hooks
export function useAdminPayouts() {
  return useQuery<PayoutItem[]>({
    queryKey: ['admin-payouts'],
    queryFn: async () => {
      const r = await apiClient.get<{ payouts: PayoutItem[] }>(
        '/api/admin/payouts/list',
      );
      return r.data.payouts;
    },
  });
}

export function useAdminPendingPayouts() {
  return useQuery<PendingShop[]>({
    queryKey: ['admin-payouts-pending'],
    queryFn: async () => {
      const r = await apiClient.get<{ shops: PendingShop[] }>(
        '/api/admin/payouts/pending',
      );
      return r.data.shops;
    },
  });
}

export function useProcessPayoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { shopId: string; note?: string }) => {
      const r = await apiClient.post<{ payout: PayoutItem }>(
        '/api/admin/payouts/process',
        data,
      );
      return r.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payouts-pending'] });
    },
  });
}

// Vendor hooks
export function useVendorPayouts() {
  return useQuery<PayoutItem[]>({
    queryKey: ['vendor-payouts'],
    queryFn: async () => {
      const r = await apiClient.get<{ payouts: PayoutItem[] }>(
        '/api/vendor/payouts/list',
      );
      return r.data.payouts;
    },
  });
}

export type PayoutSchedule = {
  schedule: {
    month: string;
    items: number;
    totalAmount: number;
    totalCommission: number;
    estimatedDate: string;
  }[];
  summary: {
    pendingItems: number;
    totalPending: number;
    totalCommission: number;
    lastPayoutDate: string | null;
    lastPayoutAmount: number;
  };
};

export function useVendorPayoutSchedule() {
  return useQuery<PayoutSchedule>({
    queryKey: ['vendor-payouts-schedule'],
    queryFn: async () => {
      const r = await apiClient.get<PayoutSchedule>(
        '/api/vendor/payouts/schedule',
      );
      return r.data;
    },
  });
}

export function useVendorPendingPayout() {
  return useQuery<{
    pendingItems: number;
    totalPending: number;
    totalCommission: number;
  }>({
    queryKey: ['vendor-payouts-pending'],
    queryFn: async () => {
      const r = await apiClient.get('/api/vendor/payouts/pending');
      return r.data as {
        pendingItems: number;
        totalPending: number;
        totalCommission: number;
      };
    },
  });
}
