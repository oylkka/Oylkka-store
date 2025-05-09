export interface CategoriesType {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes?: any;
  rating?: number;
  reviewCount?: number;
  estimatedDelivery?: string;
  warrantyInfo?: string;
  variants: ProductVariant[];
  shop: Shop;
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

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  productName: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string;
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
