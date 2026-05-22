import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type {
  FulfillmentStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/generated/prisma/enums';
import { QUERY_KEYS } from '@/lib/constants';

export type OrderListItem = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  total: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  couponDiscount: number | null;
  createdAt: string;
  itemCount: number;
  firstItemImage: string | null;
  currency: string;
};

export type OrderItemDetail = {
  id: string;
  productId: string;
  productName: string;
  variantName: string | null;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  discountPrice: number | null;
  total: number;
  fulfillmentStatus: FulfillmentStatus;
  shopId: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
};

export type OrderDetail = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  total: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  couponDiscount: number | null;
  couponCode: string | null;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingUpzila: string;
  shippingDistrict: string;
  shippingPostalCode: string | null;
  shippingComment: string | null;
  createdAt: string;
  confirmedAt: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  refundAmount: number | null;
  refundReason: string | null;
  currency: string;
  items: OrderItemDetail[];
};

export function useMyOrders(status?: string, search?: string) {
  return useQuery<OrderListItem[]>({
    queryKey: [QUERY_KEYS.ORDERS, 'my-orders', status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const qs = params.toString();
      const response = await axios.get<OrderListItem[]>(
        `/api/orders/list${qs ? `?${qs}` : ''}`,
      );
      return response.data;
    },
  });
}

export function useOrderDetail(orderId: string) {
  return useQuery<OrderDetail>({
    queryKey: [QUERY_KEYS.ORDERS, 'detail', orderId],
    queryFn: async () => {
      const response = await axios.get<OrderDetail>(`/api/orders/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
  });
}
