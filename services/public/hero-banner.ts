import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { QUERY_KEYS } from '@/lib/constants';

export function useHeroBanner() {
  return useQuery({
    queryKey: [QUERY_KEYS.HERO_BANNER],
    queryFn: async () => {
      const response = await axios.get(`/api/public/banners`);
      return response.data;
    },
  });
}
