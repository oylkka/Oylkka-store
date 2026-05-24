import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

export type CouponTier = {
  id: string;
  couponId: string;
  minQuantity: number;
  value: number;
  type: string | null;
};

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  minQuantity: number | null;
  freeShipping: boolean;
  shippingDiscount: number | null;
  bogoBuyQty: number | null;
  bogoFreeQty: number | null;
  scope: string;
  scopeId: string | null;
  maxUses: number;
  maxUsesPerUser: number;
  usedCount: number;
  claimedCount: number;
  maxClaimCount: number;
  firstOrderOnly: boolean;
  repeatPurchaseOnly: boolean;
  requiredPaymentMethod: string | null;
  platformRestriction: string;
  autoApply: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  tiers: CouponTier[];
  _count?: { usages: number };
  createdAt: string;
};

type CouponListResponse = {
  coupons: Coupon[];
  total: number;
  page: number;
  totalPages: number;
};

type CouponFilters = {
  scope?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
};

export function useAdminCoupons(filters: CouponFilters = {}) {
  const params = new URLSearchParams();
  if (filters.scope) params.set('scope', filters.scope);
  if (filters.isActive !== undefined)
    params.set('isActive', String(filters.isActive));
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  return useQuery<CouponListResponse>({
    queryKey: [QUERY_KEYS.ADMIN_COUPONS, filters],
    queryFn: async () => {
      const r = await apiClient.get<CouponListResponse>(
        `/api/admin/coupons/list?${params.toString()}`,
      );
      return r.data;
    },
  });
}

export function useAdminCoupon(id: string) {
  return useQuery<{ coupon: Coupon }>({
    queryKey: [QUERY_KEYS.ADMIN_COUPONS, id],
    queryFn: async () => {
      const r = await apiClient.get<{ coupon: Coupon }>(
        `/api/admin/coupons/${id}`,
      );
      return r.data;
    },
    enabled: !!id,
  });
}

export function useCreateCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const r = await apiClient.post<{ coupon: Coupon }>(
        '/api/admin/coupons/create',
        data,
      );
      return r.data;
    },
    onMutate: () => {
      toast.loading('Creating coupon...', { id: 'create-coupon' });
    },
    onSuccess: () => {
      toast.success('Coupon created', { id: 'create-coupon' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_COUPONS] });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || 'Failed to create coupon', {
        id: 'create-coupon',
      });
    },
  });
}

export function useUpdateCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string } & Record<string, unknown>) => {
      const r = await apiClient.put<{ coupon: Coupon }>(
        `/api/admin/coupons/${id}`,
        data,
      );
      return r.data;
    },
    onMutate: () => {
      toast.loading('Updating coupon...', { id: 'update-coupon' });
    },
    onSuccess: () => {
      toast.success('Coupon updated', { id: 'update-coupon' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_COUPONS] });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || 'Failed to update coupon', {
        id: 'update-coupon',
      });
    },
  });
}

export function useDeleteCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/admin/coupons/${id}`);
    },
    onMutate: () => {
      toast.loading('Deleting coupon...', { id: 'delete-coupon' });
    },
    onSuccess: () => {
      toast.success('Coupon deleted', { id: 'delete-coupon' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_COUPONS] });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || 'Failed to delete coupon', {
        id: 'delete-coupon',
      });
    },
  });
}
