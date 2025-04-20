export interface ProductCardType {
  id: string;
  productName: string;
  imageUrl: string;
  price: number;
  category: string;
  subcategory: string;
  discountPrice?: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  freeShipping: boolean;
}
