import { QEUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useHeroBanner() {
  return useQuery({
    queryKey: [QEUERY_KEYS.HERO_BANNER],
    queryFn: async () => {
      const response = await axios.get(`/api/dashboard/admin/banners`);
      return response.data;
    },
  });
}
