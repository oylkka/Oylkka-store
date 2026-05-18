import { RatingDisplay } from './rating-display';

type ReviewSummaryProps = {
  avgRating: number;
  totalReviewCount: number;
  ratingBreakdown: Record<number, number>;
};

export function ReviewSummary({
  avgRating,
  totalReviewCount,
  ratingBreakdown,
}: ReviewSummaryProps) {
  return (
    <div className='flex items-start gap-6 p-5 rounded-2xl border border-border bg-card'>
      <div className='text-center shrink-0'>
        <p className='text-4xl font-bold tabular-nums'>
          {avgRating > 0 ? avgRating.toFixed(1) : '\u2014'}
        </p>
        <RatingDisplay
          rating={avgRating}
          size='sm'
          className='justify-center mt-1'
        />
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
  );
}
