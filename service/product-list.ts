import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
interface FilterOptions {
  search?: string;
  color?: string;
  size?: string;
  sortby?: string;
  minPrice?: string;
  maxPrice?: string;
}

export function useProductList(filters: FilterOptions = {}) {
  return useQuery({
    queryKey: ['product-list', filters],
    queryFn: async () => {
      const response = await axios.get('/api/products/product-list', {
        params: filters,
      });
      return response.data;
    },
  });
}

export function useRelatedProduct({ id }: { id: string }) {
  return useQuery({
    queryKey: ['related-product', id],
    queryFn: async () => {
      const response = await axios.get(`/api/products/related-products`, {
        params: { productId: id },
      });
      return response.data;
    },
  });
}
