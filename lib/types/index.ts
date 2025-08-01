import type { CartItem } from './order';

export * from './banners';
export * from './order';
export interface CategoriesType {
  id: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  name: string;
  slug: string;
  description: string;
  image: {
    url: string;
    alt: string;
  };
}

export interface ProductCardType {
  id: string;
  slug: string;
  productName: string;
  stock: number;
  imageUrl: string;
  price: number;
  category: {
    name: string;
    slug: string;
  };
  discountPrice?: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  freeShipping: boolean;
  isWishlisted: boolean;
}

export interface ProductImage {
  url: string;
  publicId: string;
  alt?: string | null;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  discountPrice: number | null;
  discountPercent: number | null;
  stock: number;
  attributes: {
    color?: string;
    size?: string;
    // biome-ignore lint: error
    [key: string]: any;
  };
  image: ProductImage | null;
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  name: string;
  slug: string;
  logo: {
    url: string;
  };
  bannerImage: {
    url: string;
  };
  isVerified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  productName: string;
  description: string;
  price: number;
  discountPrice?: number;
  discountPercent: number;
  sku: string;
  category: string;
  subcategory?: string;
  brand: string;
  condition: string;
  stock: number;
  lowStockAlert?: number;
  freeShipping: boolean;
  images: ProductImage[];
  tags: string[];
  dimensions?: ProductDimensions | null;
  // biome-ignore lint: error
  attributes?: any;
  rating?: number;
  reviewCount?: number;
  estimatedDelivery?: string;
  warrantyInfo?: string;
  variants: ProductVariant[];
  shop: Shop;
  isWishlisted?: boolean;
}

export interface ProductResponse {
  product: Product;
}

export interface ShippingAddress {
  email: string;
  name: string;
  address: string;
  apartment: string;
  city: string;
  district: string;
  postalCode: string;
  phone: string;
}

export interface PaymentData {
  cart: CartItem[];
  shipping: {
    address: ShippingAddress;
    method: string;
    cost: number;
    freeShippingApplied: boolean;
  };
  payment: {
    method: string;
  };
  pricing: {
    subtotal: number;
    shippingCost: number;
    discount: {
      code: string;
      percentage: number;
      amount: number;
    };
    total: number;
  };
}

export interface BkashConfig {
  base_url?: string;
  username?: string;
  password?: string;
  app_key?: string;
  app_secret?: string;
}

export interface PaymentDetails {
  amount: number;
  callbackURL: string;
  orderID: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
}

export interface CustomerListType {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  username: string | null;
  phone: string | null;
  image: string | null;
  isActive: boolean;
  phoneVerified: boolean;
  emailVerified: boolean | null;
}

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

export interface ShopType {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address: string;
  shopEmail: string;
  shopPhone: string;
  status: 'PENDING' | 'ACTIVE';
  rating: number;
  totalSales: number;
  logo?: ProductImage | null;
  bannerImage?: ProductImage | null;
  socialLinks?: SocialLinks | null;
  // biome-ignore lint: error
  policies?: any | null;
  isVerified: boolean;
  createdAt: string;
  views: number;
  products?: ProductCardType[];
}

export interface SocialLinks {
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
}
