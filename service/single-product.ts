import { QEUERY_KEYS } from '@/constant';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useCreateProduct() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.post('/api/products/single-product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
  });
}

export function useSingleProduct({ id }: { id: string }) {
  return useQuery({
    queryKey: [QEUERY_KEYS.SINGLE_PRODUCT, id],
    queryFn: async () => {
      const response = await axios.get(`/api/products/single-product`, {
        params: { productId: id },
      });
      return response.data;
    },
  });
}
