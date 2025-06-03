export interface User {
  name?: string;
  username?: string;
  email?: string;
  role?: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
}

export interface Product {
  productName: string;
  slug?: string;
}

export interface Stats {
  orders: number;
  products: number;
  shops: number;
  users: number;
  reviews: {
    count: number;
    averageRating: number;
  };
}

export interface BaseActivity {
  id: string;
  createdAt: string;
  type: 'ORDER' | 'PRODUCT' | 'USER' | 'REVIEW';
  user?: User;
}

export interface OrderActivity extends BaseActivity {
  type: 'ORDER';
  status: 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  total: number;
}

export interface ProductActivity extends BaseActivity {
  type: 'PRODUCT';
  slug: string;
  productName: string;
}

export interface UserActivity extends BaseActivity {
  type: 'USER';
  username: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
}

export interface ReviewActivity extends BaseActivity {
  type: 'REVIEW';
  rating: number;
  content: string;
  product: Product;
}

export type Activity =
  | OrderActivity
  | ProductActivity
  | UserActivity
  | ReviewActivity;

export interface AdminStatsData {
  stats: Stats;
  recentActivity: Activity[];
}

export interface AdminStatsResponse {
  isPending: boolean;
  data: AdminStatsData;
  isError: boolean;
}

export type ActivityType = Activity['type'];
export type PaymentStatus = OrderActivity['paymentStatus'];
export type UserRole = User['role'];
