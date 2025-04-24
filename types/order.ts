export interface AdminOrderListType {
  id: string;
  orderNumber: string;
  updatedAt: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  user: {
    email: string;
    name: string;
  };
}
