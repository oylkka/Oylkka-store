import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

export type ShopPolicies = {
  shippingPolicy?: string;
  returnPolicy?: string;
  termsAndConditions?: string;
};

export function useShopPolicies() {
  return useQuery<{ policies: ShopPolicies | null }>({
    queryKey: [QUERY_KEYS.SHOP_POLICIES],
    queryFn: async () => {
      const r = await apiClient.get<{ policies: ShopPolicies | null }>(
        '/api/vendor/shop/policies',
      );
      return r.data;
    },
  });
}

export function useUpdatePoliciesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ShopPolicies) => {
      const r = await apiClient.put<{ policies: ShopPolicies }>(
        '/api/vendor/shop/policies',
        data,
      );
      return r.data;
    },
    onMutate: () => {
      toast.loading('Saving policies...', { id: 'save-policies' });
    },
    onSuccess: () => {
      toast.success('Policies saved', { id: 'save-policies' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHOP_POLICIES] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : 'Failed to save policies';
      toast.error(message, { id: 'save-policies' });
    },
  });
}
