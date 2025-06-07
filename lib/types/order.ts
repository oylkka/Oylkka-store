export interface Address {
  name: string;
  address1: string;
  address2: string | null;
  city: string;
  district: string;
  state: string | null;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  isDefault: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coordinates: any | null;
}

export interface CartItem {
  name: string;
  shopId: string;
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  productName: string;
  variantInfo: {
    variantName: string;
    sku: string;
  };
  slug: string;
  price: number;
  discountPrice: number | null;
  discountPercent: number | null;
  image: string;
  variantName: string;
  variantSku: string;
}

export interface OrderMetadata {
  paymentPending: boolean;
  cartData: CartItem[];
  paymentInitiated: boolean;
  initiatedAt: string;
  bkashPaymentID?: string;
  bkashTransactionId?: string;
}

export interface Order {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  shippingAddress: Address;
  billingAddress: Address | null;
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  trackingNumber: string | null;
  carrier: string | null;
  estimatedDelivery: string | null;
  couponCode: string | null;
  couponDiscount: number;
  notes: string | null;
  giftMessage: string | null;
  metadata: OrderMetadata;
  refundAmount: number | null;
  refundReason: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  json: {
    order: Order;
  };
  order: Order;
}

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMathod =
  | 'CREDIT_CARD'
  | 'PAYPAL'
  | 'STRIPE'
  | 'WALLET'
  | 'BKASH'
  | 'CASH_ON_DELIVERY'
  | 'BANK_TRANSFER';

export interface OrderStatusConfig {
  variant: string;
  label: string;
  className: string;
}

export interface OrderStatusBadgeProps {
  status: OrderStatus | PaymentStatus | string;
}

export interface OrderDetailsContentProps {
  orderId: string;
}

export interface OrderErrorStateProps {
  message?: string;
}
