import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

export type VoucherCoupon = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED' | 'CASHBACK';
  discountValue: number;
  minOrderAmount: number | null;
  minQuantity: number | null;
  maxUses: number | null;
  claimedCount: number;
  maxClaimCount: number;
  expiresAt: string | null;
  scope: string;
  scopeId: string | null;
  autoApply: boolean;
};

export type UserVoucher = {
  id: string;
  couponId: string;
  collectedAt: string;
  usedAt: string | null;
  coupon: VoucherCoupon;
};

export function useMyVouchers() {
  return useQuery<UserVoucher[]>({
    queryKey: [QUERY_KEYS.VOUCHERS, 'my'],
    queryFn: async () => {
      const response = await apiClient.get<UserVoucher[]>('/api/vouchers/my');
      return response.data;
    },
  });
}

export function useCollectVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponId: string) => {
      const response = await apiClient.post('/api/vouchers/collect', {
        couponId,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Voucher collected!');
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.VOUCHERS],
      });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      const msg = error.response?.data?.error || 'Failed to collect voucher';
      toast.error(msg);
    },
  });
}

export function useAutoApplyVouchers() {
  return useQuery({
    queryKey: [QUERY_KEYS.VOUCHERS, 'auto-apply'],
    queryFn: async () => {
      const response = await apiClient.get('/api/vouchers/auto-apply');
      return response.data;
    },
  });
}

export function useProductVouchers(productId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.VOUCHERS, 'product', productId],
    queryFn: async () => {
      const response = await apiClient.post('/api/vouchers/product-vouchers', {
        productId,
      });
      return response.data;
    },
    enabled: !!productId,
  });
}
