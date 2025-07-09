import { QUERY_KEYS } from '@/lib/constants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

// Get user cart
export function useUserCart() {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_CART],
    queryFn: async () => {
      const response = await axios.get(`/api/checkout/cart`);
      return response.data;
    },
  });
}

type AddToCartParams = {
  productId: string;
  quantity?: number;
  variantId?: string;
};

// Add to cart
export function useAddToCart() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
      variantId,
    }: AddToCartParams) => {
      return toast.promise(
        axios
          .post('/api/checkout/cart', {
            productId,
            quantity,
            variantId,
          })
          .then((res) => res.data),
        {
          loading: `Adding product to cart...`,
          success: () => {
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.USER_CART],
            });
            return `Product added to cart!`;
          },
          error: (err) => {
            const errorMessage = err.response?.data || 'Failed to add to cart';
            return `Error: ${errorMessage}`;
          },
        }
      );
    },
  });

  return mutation;
}

// ✅ Remove from cart
export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      return toast.promise(
        axios
          .delete(`/api/checkout/cart?cartItemId=${cartItemId}`)
          .then((res) => res.data),
        {
          loading: 'Removing item...',
          success: () => {
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.USER_CART],
            });
            return 'Item removed from cart';
          },
          error: (err) => {
            const errorMessage =
              err.response?.data || 'Failed to remove from cart';
            return `Error: ${errorMessage}`;
          },
        }
      );
    },
  });

  return mutation;
}

// ✅ Update cart quantity
type UpdateQuantityParams = {
  itemId: string;
  quantity: number;
};

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();

  const debouncedMutate = useDebouncedCallback(
    async ({ itemId, quantity }: UpdateQuantityParams) => {
      return toast.promise(
        axios
          .patch('/api/checkout/cart', { itemId, quantity })
          .then((res) => res.data),
        {
          loading: 'Updating quantity...',
          success: () => {
            queryClient.invalidateQueries({
              queryKey: [QUERY_KEYS.USER_CART],
            });
            return 'Quantity updated';
          },
          error: (err) => {
            const errorMessage =
              err.response?.data || 'Failed to update quantity';
            return `Error: ${errorMessage}`;
          },
        }
      );
    },
    400 // debounce duration in ms
  );

  return {
    mutate: debouncedMutate,
  };
}
