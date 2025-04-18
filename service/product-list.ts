import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useProductList() {
  return useQuery({
    queryKey: ['product-list'],
    queryFn: async () => {
      const response = await axios.get(`/api/products/product-list`, {
        // params: { id },
      });
      return response.data;
    },
  });
}
