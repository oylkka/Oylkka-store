import { useMutation } from '@tanstack/react-query';
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
