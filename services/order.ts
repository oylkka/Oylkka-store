import { QEUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useOrderConfirmation({ id }: { id: string }) {
  return useQuery({
    queryKey: [QEUERY_KEYS.ORDER_CONFIRMATION, id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/dashboard/user/order/single-order`,
        {
          params: { orderId: id },
        }
      );
      return response.data;
    },
  });
}

interface UseAdminOrderListParams {
  currentPage: number;
  status: string;
  search: string;
}

export function useAdminOrderList({
  currentPage,
  status,
  search,
}: UseAdminOrderListParams) {
  return useQuery({
    queryKey: [QEUERY_KEYS.ADMIN_ORDER_LIST, currentPage, status, search],
    queryFn: async () => {
      const response = await axios.get(
        '/api/dashboard/admin/order/order-list',
        {
          params: { currentPage, status, search },
        }
      );
      return response.data;
    },
  });
}

export function useSignleOrderInfo({ orderId }: { orderId: string }) {
  return useQuery({
    queryKey: [QEUERY_KEYS.SINGLE_ORDER_INFO, orderId],
    queryFn: async () => {
      const response = await axios.get(
        '/api/dashboard/admin/order/single-order',
        {
          params: { orderId },
        }
      );
      return response.data;
    },
  });
}
