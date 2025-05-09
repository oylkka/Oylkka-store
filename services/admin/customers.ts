import { QEUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useCustomersList() {
  return useQuery({
    queryKey: [QEUERY_KEYS.CUSTOMERS_LIST],
    queryFn: async () => {
      const response = await axios.get(`/api/dashboard/admin/customers/list`);
      return response.data;
    },
  });
}
