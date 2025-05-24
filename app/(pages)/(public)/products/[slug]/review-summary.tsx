'use client';

import { Loader2, MessageSquareText } from 'lucide-react';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { RatingDistributionItem } from '@/lib/types/review';

import { RatingDisplay } from './rating-display';

interface ReviewSummaryProps {
  totalReviews: number;
  avgRating: number;
  ratingDistribution: RatingDistributionItem[];
  isSessionLoading: boolean;
  isAuthenticated: boolean;
  hasUserReviewed: boolean;
  onWriteReview: () => void;
  onSignIn: () => void;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  totalReviews,
  avgRating,
  ratingDistribution,
  isSessionLoading,
  isAuthenticated,
  hasUserReviewed,
  onWriteReview,
  onSignIn,
}) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <h3 className="text-lg leading-tight font-semibold">
          Customer Reviews
        </h3>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        {totalReviews > 0 ? (
          <>
            <div className="mb-4 flex items-center gap-2">
              <p className="text-4xl font-bold">{avgRating.toFixed(1)}</p>
              <RatingDisplay rating={avgRating} size="md" />
            </div>
            <p className="text-muted-foreground mb-4 text-sm">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
            <div className="space-y-1.5">
              {ratingDistribution.map((item) => (
                <div
                  key={item.rating}
                  className="flex items-center gap-2"
                  title={`${item.count} ${item.rating}-star review(s)`}
                >
                  <span className="text-muted-foreground w-12 text-xs">
                    {item.rating} star
                  </span>
                  <Progress
                    value={item.percentage}
                    className="h-2 flex-1"
                    aria-label={`${item.percentage.toFixed(0)}% for ${item.rating} stars`}
                  />
                  <span className="text-muted-foreground w-8 text-right text-xs">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground py-4 text-sm">No reviews yet.</p>
        )}

        {isSessionLoading ? (
          <Button className="mt-6 w-full" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        ) : isAuthenticated ? (
          hasUserReviewed ? (
            <div className="mt-6 rounded-lg border border-dashed p-4 text-center">
              <p className="text-muted-foreground text-sm">
                You have already reviewed this product.
              </p>
            </div>
          ) : (
            <Button className="mt-6 w-full" onClick={onWriteReview}>
              <MessageSquareText className="mr-2 h-4 w-4" /> Write a Review
            </Button>
          )
        ) : (
          <div className="mt-6 rounded-lg border border-dashed p-4 text-center">
            <p className="text-muted-foreground mb-2 text-sm">
              Please sign in to share your experience.
            </p>
            <Button variant="outline" size="sm" onClick={onSignIn}>
              Sign In
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
