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
