'use client';
import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import OrderDetailsContent from './order-details-content';

export default function OrderDetails() {
  return (
    <Suspense fallback={<OrderDetailsSkeleton />}>
      <OrderDetailsContent />
    </Suspense>
  );
}

function OrderDetailsSkeleton() {
  return (
    <div className='mx-auto max-w-4xl space-y-6 p-4'>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className='bg-card text-card-foreground rounded-lg border shadow-sm'
        >
          <div className='flex flex-col space-y-4 p-6'>
            <Skeleton className='h-6 w-1/3' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-2/3' />
              <Skeleton className='h-4 w-3/4' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
