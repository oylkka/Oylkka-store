'use client';

import { Loader2, MessageSquareText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'; // Import AlertDialog components
import { Button } from '@/components/ui/button';
import type { ProductReview, ProductReviewsProps } from '@/lib/types/review';
import { useCreateReview, useDeleteReview, useProductReview } from '@/services';

import { ReviewCard } from './review-card';
import { ReviewForm } from './review-form';
import { ReviewSummary } from './review-summary';

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { data: session, status: sessionStatus } = useSession();
  const [reviewDialogOpen, setReviewDialogOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  // State for delete confirmation dialog
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
  const [reviewToDeleteId, setReviewToDeleteId] = useState<string | null>(null);

  const {
    data: apiResponse,
    isLoading: isLoadingReviews,
    error: reviewsError,
    refetch: refetchReviews,
  } = useProductReview({
    productId,
    userId: session?.user?.id,
    page: currentPage,
    limit: 10,
    sortBy,
    sortOrder,
  });

  const { mutateAsync: createReview, isPending: isSubmittingReview } =
    useCreateReview();

  const { mutateAsync: deleteReview, isPending: isDeletingReview } =
    useDeleteReview();

  // Now we can use the processed data directly from the backend
  const {
    reviews = [],
    averageRating: avgRating = 0,
    totalReviews = 0,
    ratingDistribution = [],
    hasUserReviewed = false,
    pagination = {},
  } = apiResponse || {};

  const handleOpenReviewDialog = () => {
    setReviewDialogOpen(true);
  };

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
  };

  const handleSignIn = () => {
    toast.info('Redirecting to sign-in...');
  };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmitReview = async (data: any) => {
    if (sessionStatus !== 'authenticated' || !session?.user?.id) {
      toast.error('Please log in to submit a review.');
      return;
    }

    if (hasUserReviewed) {
      toast.error('You have already submitted a review for this product.');
      setReviewDialogOpen(false);
      return;
    }

    const submissionToastId = toast.loading('Submitting your review...');

    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('userId', session.user.id);
    formData.append('rating', String(data.rating));
    formData.append('content', data.content);
    if (data.title) {
      formData.append('title', data.title);
    }
    (data.images || []).forEach((file: File) =>
      formData.append('images', file)
    );

    try {
      await createReview(formData);

      toast.success('Review submitted successfully!', {
        id: submissionToastId,
      });

      setReviewDialogOpen(false);
      await refetchReviews();
    } catch (err) {
      console.error('Review submission error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to submit review.';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (err instanceof Error && (err as any).response?.status === 409) {
        toast.error("You've already reviewed this product.", {
          id: submissionToastId,
        });
      } else {
        toast.error(errorMessage, { id: submissionToastId });
      }
    }
  };

  // This function now just opens the confirmation dialog
  const handleDeleteReview = (reviewId: string) => {
    setReviewToDeleteId(reviewId);
    setIsConfirmingDelete(true);
  };

  // This function performs the actual deletion after user confirmation
  const confirmDeletion = async () => {
    if (!reviewToDeleteId) {
      return;
    } // Should not happen if dialog is opened correctly

    const deletionToastId = toast.loading('Deleting review...');

    try {
      await deleteReview(reviewToDeleteId); // Use the stored reviewToDeleteId

      toast.success('Review deleted successfully!', {
        id: deletionToastId,
      });
      // Reset state after successful deletion
      setIsConfirmingDelete(false);
      setReviewToDeleteId(null);
      // refetchReviews is handled by the useDeleteReview hook's query invalidation
    } catch (err) {
      console.error('Review deletion error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete review.';

      toast.error(errorMessage, {
        id: deletionToastId,
      });
      // Close dialog and clear ID even on error
      setIsConfirmingDelete(false);
      setReviewToDeleteId(null);
    }
  };

  const handleLoadMore = () => {
    if (pagination.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleSort = (sortType: string) => {
    const newSortBy =
      sortType === 'Most Recent'
        ? 'createdAt'
        : sortType === 'Highest Rated'
          ? 'rating'
          : sortType === 'Most Helpful'
            ? 'helpful'
            : 'createdAt';

    setSortBy(newSortBy);
    setSortOrder('desc');
    setCurrentPage(1); // Reset to first page when sorting
  };

  if (isLoadingReviews) {
    return (
      <div className="flex min-h-[300px] items-center justify-center py-12">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <span className="ml-3 text-lg">Loading reviews...</span>
      </div>
    );
  }

  if (reviewsError) {
    return (
      <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-6 text-center">
        <p className="text-destructive-foreground">
          Oops! Failed to load reviews.
        </p>
        <Button
          variant="outline"
          onClick={() => refetchReviews()}
          className="mt-4"
        >
          <Loader2
            className={`mr-2 h-4 w-4 ${isLoadingReviews ? 'animate-spin' : ''}`}
          />
          Try Again
        </Button>
      </div>
    );
  }

  const isAuthenticated = sessionStatus === 'authenticated';
  const isSessionLoading = sessionStatus === 'loading';
  const isSubmittingOrDeleting = isSubmittingReview || isDeletingReview;

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col gap-x-8 gap-y-6 md:flex-row">
        {/* Review Summary */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <ReviewSummary
            totalReviews={totalReviews}
            avgRating={avgRating}
            ratingDistribution={ratingDistribution}
            isSessionLoading={isSessionLoading}
            isAuthenticated={isAuthenticated}
            hasUserReviewed={hasUserReviewed}
            onWriteReview={handleOpenReviewDialog}
            onSignIn={handleSignIn}
          />
        </div>

        {/* Review List */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <h3 className="text-lg font-semibold">
              {totalReviews > 0
                ? `Showing ${reviews.length} of ${totalReviews} Reviews`
                : 'Be the First to Review!'}
            </h3>
            {reviews.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort('Most Recent')}
                  className={
                    sortBy === 'createdAt'
                      ? 'bg-primary text-primary-foreground'
                      : ''
                  }
                >
                  Most Recent
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('Highest Rated')}
                  className={
                    sortBy === 'rating'
                      ? 'bg-primary text-primary-foreground'
                      : ''
                  }
                >
                  Highest Rated
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('Most Helpful')}
                  className={
                    sortBy === 'helpful'
                      ? 'bg-primary text-primary-foreground'
                      : ''
                  }
                >
                  Most Helpful
                </Button>
              </div>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-5">
              {reviews.map((review: ProductReview) => {
                const isCurrentUserReview = review.userId === session?.user?.id;
                const canDelete =
                  isCurrentUserReview || session?.user?.role === 'ADMIN';

                return (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    isCurrentUser={isCurrentUserReview}
                    canDelete={canDelete}
                    onDelete={handleDeleteReview} // This now opens the confirmation dialog
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
              <p className="text-muted-foreground mb-4">
                This product hasn&#39;t received any reviews yet.
              </p>
              {isSessionLoading ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking
                  status...
                </Button>
              ) : isAuthenticated ? (
                !hasUserReviewed && (
                  <Button onClick={handleOpenReviewDialog}>
                    <MessageSquareText className="mr-2 h-4 w-4" /> Write the
                    First Review
                  </Button>
                )
              ) : (
                <Button variant="outline" onClick={handleSignIn}>
                  Sign In to Write a Review
                </Button>
              )}
            </div>
          )}

          {reviews.length > 0 && pagination.hasNextPage && (
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={handleLoadMore}>
                Load More Reviews ({totalReviews - reviews.length} remaining)
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Review Form Dialog */}
      <ReviewForm
        isOpen={reviewDialogOpen}
        onClose={handleCloseReviewDialog}
        productId={productId}
        userId={session?.user?.id || ''}
        isSubmitting={isSubmittingOrDeleting}
        onSubmit={handleSubmitReview}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              review and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* When Cancel is clicked, close the dialog and clear the ID */}
            <AlertDialogCancel onClick={() => setReviewToDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            {/* When Continue is clicked, call the confirmDeletion function */}
            <AlertDialogAction onClick={confirmDeletion}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductReviews;
