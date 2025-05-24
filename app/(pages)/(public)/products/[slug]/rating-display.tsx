import { Star } from 'lucide-react';
import type React from 'react';

import { cn } from '@/lib/utils';

interface RatingDisplayProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  size = 'md',
  className,
}) => {
  const starSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn('flex items-center', className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercentage = Math.min(
          Math.max((rating - (star - 1)) * 100, 0),
          100
        );

        return (
          <div key={star} className="relative">
            <Star className={cn(starSize[size], 'text-gray-300')} />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star
                className={cn(
                  starSize[size],
                  'fill-yellow-400 text-yellow-400'
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
