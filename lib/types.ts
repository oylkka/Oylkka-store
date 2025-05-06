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
