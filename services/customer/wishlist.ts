import { QUERY_KEYS } from '@/lib/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      return toast.promise(
        axios
          .post('/api/dashboard/customer/wishlist', {
            productId,
          })
          .then((res) => res.data),
        {
          loading: `Adding product to wishlist...`,
          success: () => {
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.USER_WISHLIST],
            });
            return `Product added to wishlist!`;
          },
          error: (err) => {
            const errorMessage =
              err.response?.data || 'Failed to add to wishlist';
            return `Error: ${errorMessage}`;
          },
        }
      );
    },
  });

  return mutation;
}
