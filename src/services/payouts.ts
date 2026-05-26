import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

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
    queryKey: [QUERY_KEYS.PAYOUTS],
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
    queryKey: [QUERY_KEYS.PAYOUTS, 'pending'],
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

  return useMutation<
    { payout: PayoutItem },
    Error,
    { shopId: string; note?: string }
  >({
    mutationFn: async (data) => {
      const r = await apiClient.post<{ payout: PayoutItem }>(
        '/api/admin/payouts/process',
        data,
      );
      return r.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYOUTS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PAYOUTS, 'pending'],
      });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to process payout';
      toast.error(`Error: ${message}`);
    },
  });
}

// Vendor hooks
export function useVendorPayouts() {
  return useQuery<PayoutItem[]>({
    queryKey: [QUERY_KEYS.PAYOUTS, 'vendor'],
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
    queryKey: [QUERY_KEYS.PAYOUTS, 'vendor', 'schedule'],
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
    queryKey: [QUERY_KEYS.PAYOUTS, 'vendor', 'pending'],
    queryFn: async () => {
      const r = await apiClient.get<{
        pendingItems: number;
        totalPending: number;
        totalCommission: number;
      }>('/api/vendor/payouts/pending');
      return r.data;
    },
  });
}
