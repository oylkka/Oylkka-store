import { QEUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Get user cart
export function useVendorShop() {
  return useQuery({
    queryKey: [QEUERY_KEYS.VENDOR_SHOP],
    queryFn: async () => {
      const response = await axios.get(`/api/dashboard/vendor/my-shop`);
      return response.data;
    },
  });
}
