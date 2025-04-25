import { QEUERY_KEYS } from '@/constant';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useProductList({ currentPage = 1 }: { currentPage?: number }) {
  return useQuery({
    queryKey: [QEUERY_KEYS.PRODUCT_LIST, currentPage],
    queryFn: async () => {
      const response = await axios.get('/api/products/product-list', {
        params: { currentPage },
      });
      return response.data;
    },
  });
}

export function useRelatedProduct({ id }: { id: string }) {
  return useQuery({
    queryKey: [QEUERY_KEYS.RELATED_PRODUCT, id],
    queryFn: async () => {
      const response = await axios.get(`/api/products/related-products`, {
        params: { productId: id },
      });
      return response.data;
    },
  });
}
