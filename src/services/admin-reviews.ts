import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';

export type ReviewImage = {
  id: string;
  imageUrl: string;
  order: number;
};

export type AdminReview = {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  verified: boolean;
  reported: boolean;
  reportReason: string | null;
  reviewedByAdmin: boolean;
  helpfulCount: number;
  vendorReply: string | null;
  vendorRepliedAt: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; imageUrl: string };
  product: {
    id: string;
    productName: string;
    slug: string;
    images: { imageUrl: string }[];
  };
  images: ReviewImage[];
};

type ReviewListResponse = {
  reviews: AdminReview[];
  total: number;
  page: number;
  totalPages: number;
};

type ReviewFilters = {
  reported?: boolean;
  verified?: boolean;
  minRating?: number;
  search?: string;
  page?: number;
  limit?: number;
};

export function useAdminReviews(filters: ReviewFilters = {}) {
  const params = new URLSearchParams();
  if (filters.reported !== undefined)
    params.set('reported', String(filters.reported));
  if (filters.verified !== undefined)
    params.set('verified', String(filters.verified));
  if (filters.minRating) params.set('minRating', String(filters.minRating));
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  return useQuery<ReviewListResponse>({
    queryKey: [QUERY_KEYS.ADMIN_REVIEWS, filters],
    queryFn: async () => {
      const r = await apiClient.get<ReviewListResponse>(
        `/api/admin/reviews/list?${params.toString()}`,
      );
      return r.data;
    },
  });
}

export function useAdminReview(id: string) {
  return useQuery<{ review: AdminReview }>({
    queryKey: [QUERY_KEYS.ADMIN_REVIEWS, id],
    queryFn: async () => {
      const r = await apiClient.get<{ review: AdminReview }>(
        `/api/admin/reviews/${id}`,
      );
      return r.data;
    },
    enabled: !!id,
  });
}

export function useModerateReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      verified?: boolean;
      reported?: boolean;
      reviewedByAdmin?: boolean;
    }) => {
      const r = await apiClient.put<{ review: AdminReview }>(
        `/api/admin/reviews/${id}`,
        data,
      );
      return r.data;
    },
    onMutate: () => {
      toast.loading('Moderating review...', { id: 'moderate-review' });
    },
    onSuccess: () => {
      toast.success('Review moderated', { id: 'moderate-review' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_REVIEWS] });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || 'Failed to moderate review', {
        id: 'moderate-review',
      });
    },
  });
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/admin/reviews/${id}`);
    },
    onMutate: () => {
      toast.loading('Deleting review...', { id: 'delete-review' });
    },
    onSuccess: () => {
      toast.success('Review deleted', { id: 'delete-review' });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_REVIEWS] });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || 'Failed to delete review', {
        id: 'delete-review',
      });
    },
  });
}
