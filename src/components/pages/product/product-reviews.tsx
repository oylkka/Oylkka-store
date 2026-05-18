import { Image } from '@unpic/react';
import {
  BadgeCheck,
  ChevronDown,
  MessageCircle,
  Star,
  ThumbsUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { type PublicReview, usePublicProductReviews } from '@/services/product';

type ProductReviewsProps = {
  productId: string;
  totalReviewCount: number;
  ratingBreakdown: Record<number, number>;
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

export function ProductReviews({
  productId,
  totalReviewCount,
  ratingBreakdown,
}: ProductReviewsProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = usePublicProductReviews(productId, page);

  const reviews = data?.reviews ?? [];
  const totalPages = data?.totalPages ?? 0;
  const hasMore = page < totalPages;

  const avgRating =
    totalReviewCount > 0
      ? Object.entries(ratingBreakdown).reduce(
          (sum, [star, count]) => sum + Number(star) * count,
          0,
        ) / totalReviewCount
      : 0;

  return (
    <div className='space-y-8'>
      <div className='flex items-start gap-6 p-5 rounded-2xl border border-border bg-card'>
        <div className='text-center shrink-0'>
          <p className='text-4xl font-bold tabular-nums'>
            {avgRating > 0 ? avgRating.toFixed(1) : '—'}
          </p>
          <div className='flex items-center justify-center gap-0.5 mt-1'>
            {[{ i: 0 }, { i: 1 }, { i: 2 }, { i: 3 }, { i: 4 }].map(({ i }) => (
              <Star
                key={i}
                className={cn(
                  'w-3.5 h-3.5',
                  i < Math.round(avgRating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-muted-foreground',
                )}
              />
            ))}
          </div>
          <p className='text-xs text-muted-foreground mt-1'>
            {totalReviewCount.toLocaleString()} reviews
          </p>
        </div>

        <div className='flex-1 flex flex-col gap-1.5'>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingBreakdown[star] ?? 0;
            const pct =
              totalReviewCount > 0 ? (count / totalReviewCount) * 100 : 0;
            return (
              <div key={star} className='flex items-center gap-2'>
                <span className='text-xs text-muted-foreground w-3 shrink-0'>
                  {star}
                </span>
                <div className='flex-1 h-1.5 rounded-full bg-muted overflow-hidden'>
                  <div
                    className='h-full bg-amber-400 rounded-full transition-all duration-500'
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className='text-xs text-muted-foreground w-6 text-right tabular-nums'>
                  {Math.round(pct)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className='space-y-4'>
          {[0, 1, 2].map((i) => (
            <ReviewSkeleton key={`skel-${i}`} />
          ))}
        </div>
      )}

      {isError && (
        <p className='text-sm text-muted-foreground text-center py-8'>
          Failed to load reviews.
        </p>
      )}

      {!isLoading && !isError && reviews.length === 0 && (
        <div className='flex flex-col items-center justify-center py-12 gap-4 text-center'>
          <div className='w-16 h-16 rounded-2xl bg-muted flex items-center justify-center'>
            <MessageCircle className='w-7 h-7 text-muted-foreground' />
          </div>
          <div>
            <p className='text-sm font-semibold'>No reviews yet</p>
            <p className='text-sm text-muted-foreground mt-1 max-w-xs'>
              Be the first to share your thoughts on this product.
            </p>
          </div>
        </div>
      )}

      {!isLoading && !isError && reviews.length > 0 && (
        <motion.div
          initial='hidden'
          animate='show'
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06 } },
          }}
          className='space-y-4'
        >
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </motion.div>
      )}

      {hasMore && (
        <div className='flex justify-center pt-2'>
          <Button
            variant='outline'
            size='sm'
            className='gap-2'
            onClick={() => setPage((p) => p + 1)}
            disabled={isLoading}
          >
            <ChevronDown className='w-4 h-4' />
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: PublicReview }) {
  const [showAllImages, setShowAllImages] = useState(false);
  const displayImages = review.images.slice(
    0,
    showAllImages ? review.images.length : 3,
  );
  const hasMoreImages = review.images.length > 3 && !showAllImages;

  return (
    <motion.div
      variants={cardVariants}
      className='rounded-2xl border border-border bg-card p-5'
    >
      <div className='flex items-start gap-3 mb-3'>
        <div className='w-9 h-9 rounded-full bg-muted overflow-hidden shrink-0 ring-2 ring-border'>
          {review.user.image ? (
            <Image
              src={review.user.image}
              width={40}
              height={40}
              alt={review.user.name}
              layout='fixed'
              className='object-cover w-full h-full'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-primary/10'>
              <span className='text-xs font-bold text-primary'>
                {review.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='text-sm font-semibold'>{review.user.name}</span>
            {review.verified && (
              <BadgeCheck className='w-3.5 h-3.5 text-primary shrink-0' />
            )}
          </div>
          <div className='flex items-center gap-2 mt-0.5'>
            <div className='flex items-center gap-0.5'>
              {[{ i: 0 }, { i: 1 }, { i: 2 }, { i: 3 }, { i: 4 }].map(
                ({ i }) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-3 h-3',
                      i < review.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-muted-foreground',
                    )}
                  />
                ),
              )}
            </div>
            <span className='text-xs text-muted-foreground'>
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {review.title && (
        <h4 className='text-sm font-semibold mb-1'>{review.title}</h4>
      )}
      <p className='text-sm text-muted-foreground leading-relaxed'>
        {review.content}
      </p>

      {review.images.length > 0 && (
        <div className='flex gap-2 mt-3 overflow-x-auto scrollbar-none'>
          {displayImages.map((img) => (
            <div
              key={img.id}
              className='relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 ring-1 ring-border'
            >
              <Image
                src={img.imageUrl}
                width={80}
                height={80}
                alt='Review image'
                layout='fixed'
                className='object-cover w-full h-full'
              />
            </div>
          ))}
          {hasMoreImages && (
            <button
              type='button'
              onClick={() => setShowAllImages(true)}
              className='w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors'
            >
              +{review.images.length - 3}
            </button>
          )}
        </div>
      )}

      <div className='flex items-center gap-3 mt-3 pt-3 border-t border-border'>
        <button
          type='button'
          className='flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors'
        >
          <ThumbsUp className='w-3.5 h-3.5' />
          <span>{review.helpfulCount}</span>
        </button>
      </div>

      {review.vendorReply && (
        <div className='mt-3 pt-3 border-t border-border bg-muted/30 rounded-lg p-3'>
          <p className='text-xs font-semibold text-primary mb-1'>
            Seller Response
          </p>
          <p className='text-sm text-muted-foreground leading-relaxed'>
            {review.vendorReply}
          </p>
          {review.vendorRepliedAt && (
            <p className='text-xs text-muted-foreground mt-1'>
              {new Date(review.vendorRepliedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

function ReviewSkeleton() {
  return (
    <div className='rounded-2xl border border-border p-5'>
      <div className='flex items-start gap-3 mb-3'>
        <Skeleton className='w-9 h-9 rounded-full shrink-0' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-3 w-24' />
        </div>
      </div>
      <Skeleton className='h-3 w-full mb-2' />
      <Skeleton className='h-3 w-3/4 mb-2' />
      <Skeleton className='h-3 w-1/2' />
      <div className='flex gap-2 mt-3'>
        {[0, 1, 2].map((i) => (
          <Skeleton key={`img-skel-${i}`} className='w-16 h-16 rounded-lg' />
        ))}
      </div>
    </div>
  );
}
