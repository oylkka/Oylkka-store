import { QUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useVendorsList() {
  return useQuery({
    queryKey: [QUERY_KEYS.VENDORS_LIST],
    queryFn: async () => {
      const response = await axios.get(`/api/dashboard/admin/vendors/list`);
      return response.data;
    },
  });
}
