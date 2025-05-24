export interface ProductReviewUser {
  id: string;
  name: string | null;
  image?: string | null;
}

export interface ProductReviewImage {
  url: string;
  publicId: string;
  alt?: string | null;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  orderId?: string | null;
  rating: number;
  title?: string | null;
  content: string;
  images: ProductReviewImage[];
  verified: boolean;
  helpful: number;
  reported: boolean;
  createdAt: string;
  updatedAt: string;
  user?: ProductReviewUser | null;
}

export interface ProductReviewsApiResponse {
  averageRating: number;
  ratingCount: number;
  allReviewsDetails: ProductReview[];
}

export interface RatingDistributionItem {
  rating: number;
  count: number;
  percentage: number;
}

export interface ProcessedReviewsData {
  reviews: ProductReview[];
  avgRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistributionItem[];
  currentUserReview: ProductReview | null;
  hasUserReviewed: boolean;
}

export interface ProductReviewsProps {
  productId: string;
}
