import { QUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useUserReviews() {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_REVIEWS],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/customer/reviews');
      return data;
    },
  });
}
