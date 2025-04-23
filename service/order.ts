import { QEUERY_KEYS } from '@/constant';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useOrderConfirmation({ id }: { id: string }) {
  return useQuery({
    queryKey: [QEUERY_KEYS.ORDER_CONFIRMATION, id],
    queryFn: async () => {
      const response = await axios.get(`/api/dashboard/user/order/single-order`, {
        params: { orderId: id },
      });
      return response.data;
    },
  });
}
