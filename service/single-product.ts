import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

export function useCreateProduct() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await toast.promise(
        axios.post('/api/products/single-product', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }),
        {
          loading: 'Submitting product...',
          success: 'Product submitted successfully!',
          error: (err) =>
            err?.response?.data?.message || 'Failed to submit product',
        }
      );
    },
  });
}

export function useSingleProduct({ id }: { id: string }) {
  return useQuery({
    queryKey: ['single-product', id],
    queryFn: async () => {
      const response = await axios.get(`/api/products/single-product`, {
        params: { productId: id },
      });
      return response.data;
    },
  });
}
