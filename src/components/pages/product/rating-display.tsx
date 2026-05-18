import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type RatingDisplayProps = {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const starSizes = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' };

export function RatingDisplay({
  rating,
  size = 'md',
  className,
}: RatingDisplayProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPct = Math.min(Math.max((rating - (star - 1)) * 100, 0), 100);
        return (
          <div key={star} className='relative'>
            <Star
              className={cn(
                starSizes[size],
                'text-gray-300 dark:text-gray-600',
              )}
            />
            <div
              className='absolute inset-0 overflow-hidden'
              style={{ width: `${fillPct}%` }}
            >
              <Star
                className={cn(
                  starSizes[size],
                  'fill-yellow-400 text-yellow-400',
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
