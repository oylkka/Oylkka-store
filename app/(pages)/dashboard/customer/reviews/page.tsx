'use client';

import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import {
  AlertTriangle,
  Calendar,
  ExternalLink,
  MessageSquare,
  Package,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeleteReview } from '@/services';
import { useUserReviews } from '@/services/customer/reviews';

interface ProductImage {
  url: string;
}

interface Product {
  id: string;
  slug: string;
  productName: string;
  images: ProductImage[];
}

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  product: Product;
}

export default function Reviews() {
  const { isPending, data, isError } = useUserReviews();
  const { mutateAsync: deleteReview } = useDeleteReview();
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (isToday(date)) {
      return 'Today';
    }
    if (isYesterday(date)) {
      return 'Yesterday';
    }

    const daysAgo = formatDistanceToNow(date, { addSuffix: true });
    if (daysAgo.includes('day') && !daysAgo.includes('month')) {
      return daysAgo;
    }

    return format(date, 'MMM d, yyyy');
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const starSize = size === 'sm' ? 'h-3 w-3' : 'h-5 w-5';
    return (
      <div className='flex items-center gap-0.5'>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            //  biome-ignore lint: error
            key={i}
            className={`${starSize} transition-colors ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-muted text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingVariant = (rating: number) => {
    if (rating >= 4) {
      return 'default';
    }
    if (rating >= 3) {
      return 'secondary';
    }
    return 'destructive';
  };

  const getRatingText = (rating: number) => {
    if (rating === 5) {
      return 'Excellent';
    }
    if (rating === 4) {
      return 'Very Good';
    }
    if (rating === 3) {
      return 'Good';
    }
    if (rating === 2) {
      return 'Fair';
    }
    return 'Poor';
  };

  const handleDeleteReview = async (reviewId: string, productName: string) => {
    try {
      setDeletingReviewId(reviewId);
      await deleteReview(reviewId);
      toast(`Your review for "${productName}" has been deleted successfully.`);
      //  biome-ignore lint: error
    } catch (error) {
      toast('Failed to delete review. Please try again.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (isPending) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <Skeleton className='mb-3 h-9 w-48' />
          <Skeleton className='h-5 w-64' />
        </div>
        <div className='space-y-6'>
          {Array.from({ length: 4 }).map((_, i) => (
            //  biome-ignore lint: error
            <Card key={i} className='p-6'>
              <div className='mb-4 flex items-start gap-4'>
                <Skeleton className='h-16 w-16 rounded-lg' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-5 w-3/4' />
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-4 w-24' />
                </div>
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-5 w-1/2' />
                <Skeleton className='h-16 w-full' />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Alert variant='destructive' className='mx-auto max-w-2xl'>
          <AlertDescription>
            Failed to load your reviews. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const reviews: Review[] = data || [];

  if (reviews.length === 0) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='py-20 text-center'>
          <div className='relative mb-6'>
            <div className='bg-muted/50 mx-auto flex h-20 w-20 items-center justify-center rounded-full'>
              <MessageSquare className='text-muted-foreground h-10 w-10' />
            </div>
          </div>
          <h2 className='mb-2 text-2xl font-semibold'>No reviews yet</h2>
          <p className='text-muted-foreground mx-auto mb-6 max-w-sm'>
            Start shopping and share your experience with our community
          </p>
          <Button>Start Shopping</Button>
        </div>
      </div>
    );
  }

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header Section */}
      <div className='mb-8'>
        <div className='mb-4 flex items-center gap-3'>
          <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
            <Sparkles className='text-primary h-5 w-5' />
          </div>
          <h1 className='text-3xl font-bold'>My Reviews</h1>
        </div>

        <div className='text-muted-foreground flex items-center gap-6'>
          <div className='flex items-center gap-2'>
            <span className='text-foreground text-lg font-semibold'>
              {reviews.length}
            </span>
            <span>{reviews.length === 1 ? 'review' : 'reviews'}</span>
          </div>
          <div className='flex items-center gap-2'>
            {renderStars(Math.round(averageRating), 'sm')}
            <span className='text-sm font-medium'>
              {averageRating.toFixed(1)} average
            </span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className='space-y-6'>
        {reviews.map((review, index) => (
          <Card
            key={review.id}
            className='group transition-shadow duration-200 hover:shadow-md'
          >
            <CardHeader className='pb-4'>
              <div className='flex items-start gap-4'>
                <div className='relative'>
                  <Avatar className='border-border h-16 w-16 rounded-lg border-2'>
                    <AvatarImage
                      src={review.product.images[0]?.url || '/placeholder.svg'}
                      alt={review.product.productName}
                      className='object-cover'
                    />
                    <AvatarFallback className='rounded-lg'>
                      <Package className='h-6 w-6' />
                    </AvatarFallback>
                  </Avatar>
                  <div className='bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium'>
                    {index + 1}
                  </div>
                </div>

                <div className='min-w-0 flex-1'>
                  <div className='mb-2 flex items-start justify-between'>
                    <Link
                      href={`/products/${review.product.slug}`}
                      className='group/link hover:text-primary inline-flex items-center gap-2 transition-colors'
                    >
                      <h3 className='truncate text-lg font-semibold'>
                        {review.product.productName}
                      </h3>
                      <ExternalLink className='h-4 w-4 opacity-0 transition-opacity group-hover/link:opacity-100' />
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 opacity-0 transition-all group-hover:opacity-100'
                          disabled={deletingReviewId === review.id}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className='flex items-center gap-2'>
                            <AlertTriangle className='text-destructive h-5 w-5' />
                            Delete Review
                          </AlertDialogTitle>
                          <AlertDialogDescription className='space-y-2'>
                            <span>
                              Are you sure you want to delete your review for
                              &quot;
                              {review.product.productName}&quot;?
                            </span>
                            <span className='text-muted-foreground text-sm'>
                              This action cannot be undone.
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDeleteReview(
                                review.id,
                                review.product.productName,
                              )
                            }
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            disabled={deletingReviewId === review.id}
                          >
                            {deletingReviewId === review.id
                              ? 'Deleting...'
                              : 'Delete Review'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className='mb-3 flex items-center gap-3'>
                    {renderStars(review.rating)}
                    <Badge
                      variant={getRatingVariant(review.rating)}
                      className='font-medium'
                    >
                      {review.rating}/5 • {getRatingText(review.rating)}
                    </Badge>
                  </div>

                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <Calendar className='h-4 w-4' />
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className='pt-0'>
              <div className='border-primary/20 space-y-2 border-l-4 pl-4'>
                <h4 className='text-base font-semibold'>
                  &quot;{review.title}&quot;
                </h4>
                <p className='text-muted-foreground leading-relaxed'>
                  {review.content}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      {reviews.length > 0 && (
        <div className='mt-12 text-center'>
          <div className='bg-muted/50 inline-flex items-center gap-2 rounded-full border px-4 py-2'>
            <Sparkles className='text-primary h-4 w-4' />
            <p className='text-muted-foreground text-sm'>
              Thank you for sharing your feedback with our community!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
