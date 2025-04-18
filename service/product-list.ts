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
