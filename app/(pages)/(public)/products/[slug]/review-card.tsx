'use client';

import type React from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { ProductReview } from '@/lib/types/review';
import { cn } from '@/lib/utils';

import { RatingDisplay } from './rating-display';
import { ReviewImages } from './review-images';

interface ReviewCardProps {
  review: ProductReview;
  isCurrentUser: boolean;
  canDelete?: boolean;
  onDelete?: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  isCurrentUser,
  canDelete = false,
  onDelete,
}) => {
  const handleHelpful = () => {
    toast.info(`Helpful action for review ${review.id} (Not implemented)`);
  };

  const handleReport = () => {
    toast.info(`Report action for review ${review.id} (Not implemented)`);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(review.id);
    }
  };

  return (
    <Card
      className={cn(
        'overflow-hidden',
        isCurrentUser && 'border-primary ring-primary/50 ring-2'
      )}
    >
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2 md:p-6 md:pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 md:h-10 md:w-10">
            <AvatarImage
              src={review.user?.image || undefined}
              alt={review.user?.name || 'User avatar'}
            />
            <AvatarFallback>
              {(review.user?.name || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm leading-tight font-semibold md:text-base">
              {review.user?.name || 'Anonymous User'}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <RatingDisplay rating={review.rating} size="sm" />
              {review.verified && (
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-xs font-medium"
                >
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
        <span className="text-muted-foreground pt-1 text-xs whitespace-nowrap">
          {new Date(review.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </CardHeader>

      <CardContent className="p-4 pt-1 md:p-6 md:pt-2">
        {review.title && (
          <h4 className="text-md mb-1.5 leading-tight font-semibold">
            {review.title}
          </h4>
        )}
        <p className="text-foreground/90 text-sm leading-relaxed">
          {review.content}
        </p>

        <ReviewImages images={review.images || []} />

        <div className="mt-3 flex flex-col items-start gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground text-xs">
            {review.helpful > 0
              ? `${review.helpful} people found this helpful`
              : 'Was this review helpful?'}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={handleHelpful}>
              Helpful ({review.helpful})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={handleReport}
            >
              Report
            </Button>
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
