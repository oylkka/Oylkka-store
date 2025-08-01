import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/lib/constants';

export function useToggleWishlist() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      const response = await axios.post<{ added: boolean }>(
        '/api/dashboard/customer/wishlist',
        {
          productId,
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.FEATURED_PRODUCTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PRODUCT_LIST],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SINGLE_PRODUCT],
      });
      toast.success(
        data.added
          ? 'Product added to wishlist!'
          : 'Product removed from wishlist.',
      );
    },

    // biome-ignore lint: error
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || 'Failed to update wishlist';
      toast.error(`Error: ${errorMessage}`);
    },
  });

  return mutation;
}

export function useWishlist() {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_WISHLIST],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/customer/wishlist');
      return data;
    },
  });
}
