import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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
    queryKey: ['adminOrderList', currentPage, status, search],
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
