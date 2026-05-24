import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

export type ShopPolicies = {
  shippingPolicy?: string;
  returnPolicy?: string;
  termsAndConditions?: string;
};

export function useShopPolicies() {
  return useQuery<{ policies: ShopPolicies | null }>({
    queryKey: ['shop-policies'],
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
      queryClient.invalidateQueries({ queryKey: ['shop-policies'] });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(
        error.response?.data?.error || 'Failed to save policies',
        { id: 'save-policies' },
      );
    },
  });
}
