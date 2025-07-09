import { QUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useUserOrders() {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_ORDERS],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/customer/order');
      return data;
    },
  });
}
