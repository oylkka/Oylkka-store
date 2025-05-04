import { QEUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useProductCategories() {
  return useQuery({
    queryKey: [QEUERY_KEYS.PRODUCT_CATEGORIES],
    queryFn: async () => {
      const response = await axios.get(`/api/public/categories`);
      return response.data;
    },
  });
}
