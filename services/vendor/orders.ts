import { QEUERY_KEYS } from '@/lib/constants';
import { Order } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

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
    queryKey: [QEUERY_KEYS.VENDOR_ORDERS, page, status, search],
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
    queryKey: [QEUERY_KEYS.VENDOR_SHOP],
    queryFn: async () => {
      const response = await axios.get(`/api/dashboard/vendor/my-shop`);
      return response.data;
    },
  });
}

export function useShopList() {
  return useQuery({
    queryKey: [QEUERY_KEYS.SHOP_LIST],
    queryFn: async () => {
      const response = await axios.get(`/api/public/shop-list`);
      return response.data;
    },
  });
}
export function useShopDetails({ slug }: { slug: string }) {
  return useQuery({
    queryKey: [QEUERY_KEYS.SHOP_DETAILS, slug],
    queryFn: async () => {
      const response = await axios.get(`/api/public/shop-list/single-shop`, {
        params: { slug: slug },
      });
      return response.data;
    },
  });
}
