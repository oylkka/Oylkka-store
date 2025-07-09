import { QUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useFeaturedProducts() {
  return useQuery({
    queryKey: [QUERY_KEYS.FEATURED_PRODUCTS],
    queryFn: async () => {
      const response = await axios.get(`/api/public/featured-products`);
      return response.data;
    },
  });
}
