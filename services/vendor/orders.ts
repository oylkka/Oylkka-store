import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import type { Order } from '@/lib/types';

interface VendorOrdersResponse {
  orders: Order[];
  pagination: {
    totalOrders: number;
    totalPages: number;
    currentPage: number;
  };
}

export function useVendorOrders({
  page = 1,
  status = 'ALL',
  search = '',
}: {
  page?: number;
  status?: string;
  search?: string;
}) {
  return useQuery<VendorOrdersResponse, Error>({
    queryKey: [QUERY_KEYS.VENDOR_ORDERS, page, status, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        currentPage: page.toString(),
        status,
        search,
      });
      const response = await fetch(`/api/dashboard/vendor/orders?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch vendor orders');
      }
      return response.json();
    },
  });
}

import axios from 'axios';

export function useVendorShop() {
  return useQuery({
    queryKey: [QUERY_KEYS.VENDOR_SHOP],
    queryFn: async () => {
      const response = await axios.get(`/api/dashboard/vendor/my-shop`);
      return response.data;
    },
  });
}

export function useShopList() {
  return useQuery({
    queryKey: [QUERY_KEYS.SHOP_LIST],
    queryFn: async () => {
      const response = await axios.get(`/api/public/shop-list`);
      return response.data;
    },
  });
}
export function useShopDetails({ slug }: { slug: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.SHOP_DETAILS, slug],
    queryFn: async () => {
      const response = await axios.get(`/api/public/shop-list/single-shop`, {
        params: { slug: slug },
      });
      return response.data;
    },
  });
}
export function useSingleVendorOrder({ orderId }: { orderId: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.SINGLE_VENDOR_ORDER, orderId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/dashboard/vendor/orders/single-order`,
        {
          params: { orderId: orderId },
        },
      );
      return response.data;
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateOrderStatusData {
  orderId: string;
  vendorId: string;
  orderStatus?: string;
  paymentStatus?: string;
}

export async function updateOrderStatus(data: UpdateOrderStatusData) {
  try {
    const response = await axios.patch(
      '/api/dashboard/vendor/orders/single-order',
      data,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || 'Failed to update order status';
      throw new Error(message);
    }
    throw error;
  }
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      // Invalidate and refetch orders queries
      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEYS.VENDOR_ORDERS,
          QUERY_KEYS.ADMIN_ORDER_LIST,
          QUERY_KEYS.SINGLE_VENDOR_ORDER,
        ],
      });
    },
  });
}
