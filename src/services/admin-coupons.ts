import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
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

export type CouponFormValues = {
  code: string;
  description?: string | null;
  type: string;
  value: number;
  scope: string;
  scopeId?: string | null;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  minQuantity?: number | null;
  freeShipping?: boolean;
  shippingDiscount?: number | null;
  bogoBuyQty?: number | null;
  bogoFreeQty?: number | null;
  maxUses?: number;
  maxUsesPerUser?: number;
  maxClaimCount?: number;
  firstOrderOnly?: boolean;
  repeatPurchaseOnly?: boolean;
  requiredPaymentMethod?: string | null;
  platformRestriction?: string;
  autoApply?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
  tiers?: Array<{ minQuantity: number; value: number; type?: string }>;
};

export function useCreateCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ coupon: Coupon }, Error, CouponFormValues>({
    mutationFn: async (data) => {
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
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to create coupon';
      toast.error(message, { id: 'create-coupon' });
    },
  });
}

export function useUpdateCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { coupon: Coupon },
    Error,
    { id: string } & Partial<CouponFormValues>
  >({
    mutationFn: async ({ id, ...data }) => {
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
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to update coupon';
      toast.error(message, { id: 'update-coupon' });
    },
  });
}

export function useDeleteCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.delete(`/api/admin/coupons/${id}`);
    },
    onMutate: () => {
      toast.loading('Deleting coupon...', { id: 'delete-coupon' });
    },
    onSuccess: () => {
      toast.success('Coupon deleted', { id: 'delete-coupon' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_COUPONS] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to delete coupon';
      toast.error(message, { id: 'delete-coupon' });
    },
  });
}
