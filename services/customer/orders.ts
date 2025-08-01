import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { QUERY_KEYS } from '@/lib/constants';

export function useUserOrders() {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_ORDERS],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/customer/order');
      return data;
    },
  });
}
