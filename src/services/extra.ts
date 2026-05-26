import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

// --- ShopFollow ---
type ShopFollowItem = {
  id: string;
  shopId: string;
  shop: { id: string; name: string; slug: string; logoUrl: string | null };
  createdAt: string;
};

export function useFollowedShops() {
  return useQuery<ShopFollowItem[]>({
    queryKey: [QUERY_KEYS.FOLLOWED_SHOPS],
    queryFn: async () => {
      const r = await apiClient.get<{ follows: ShopFollowItem[] }>(
        '/api/shop/follow/list',
      );
      return r.data.follows;
    },
  });
}

export function useToggleFollowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (shopId: string) => {
      const r = await apiClient.post<{ following: boolean }>(
        '/api/shop/follow/toggle',
        { shopId },
      );
      return r.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLLOWED_SHOPS] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to toggle follow';
      toast.error(`Error: ${message}`);
    },
  });
}

// --- ProductReport ---
export function useReportProductMutation() {
  return useMutation({
    mutationFn: async (data: {
      productId: string;
      reason: string;
      details?: string;
    }) => {
      const r = await apiClient.post<{ report: unknown }>(
        '/api/product/report/create',
        data,
      );
      return r.data;
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to submit report';
      toast.error(`Error: ${message}`);
    },
  });
}
