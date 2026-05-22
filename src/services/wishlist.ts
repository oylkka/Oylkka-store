import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

export type WishlistItem = {
  id: string;
  productId: string;
  variantId: string | null;
  product: {
    id: string;
    productName: string;
    slug: string;
    price: number;
    discountPrice: number | null;
    images: { imageUrl: string }[];
  };
  variant: {
    id: string;
    name: string;
    price: number;
    discountPrice: number | null;
  } | null;
};

export function useWishlist(options?: { enabled?: boolean }) {
  return useQuery<{ items: WishlistItem[] }>({
    queryKey: [QUERY_KEYS.WISHLIST],
    enabled: options?.enabled,
    queryFn: async () => {
      const response = await apiClient.get<{ items: WishlistItem[] }>(
        '/api/wishlist/list',
      );
      return response.data;
    },
  });
}

export function useAddToWishlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { productId: string; variantId?: string }) => {
      const response = await apiClient.post('/api/wishlist/add', input);
      return response.data;
    },
    onMutate: () => {
      toast.loading('Adding to wishlist...', { id: 'wishlist-add' });
    },
    onSuccess: () => {
      toast.success('Added to wishlist!', { id: 'wishlist-add' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST] });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      const msg = error.response?.data?.error || 'Failed to add to wishlist';
      toast.error(msg, { id: 'wishlist-add' });
    },
  });
}

export function useRemoveFromWishlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { productId: string; variantId?: string }) => {
      const response = await apiClient.post('/api/wishlist/remove', input);
      return response.data;
    },
    onMutate: () => {
      toast.loading('Removing from wishlist...', { id: 'wishlist-remove' });
    },
    onSuccess: () => {
      toast.success('Removed from wishlist', { id: 'wishlist-remove' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WISHLIST] });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      const msg =
        error.response?.data?.error || 'Failed to remove from wishlist';
      toast.error(msg, { id: 'wishlist-remove' });
    },
  });
}
