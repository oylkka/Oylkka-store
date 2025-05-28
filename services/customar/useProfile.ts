import { QEUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useProfile() {
  return useQuery({
    queryKey: [QEUERY_KEYS.USER_PROFILE],
    queryFn: async () => {
      const response = await axios.get(`/api/dashboard/customar/profile`);
      return response.data;
    },
  });
}
