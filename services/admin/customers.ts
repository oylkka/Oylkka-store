import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { QUERY_KEYS } from '@/lib/constants';

export function useCustomersList() {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMERS_LIST],
    queryFn: async () => {
      const response = await axios.get(`/api/dashboard/admin/customers/list`);
      return response.data;
    },
  });
}
