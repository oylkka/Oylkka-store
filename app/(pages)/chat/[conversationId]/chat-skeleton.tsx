'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function ChatLoadingSkeleton() {
  return (
    <div className='from-background to-muted/20 flex h-full flex-col bg-gradient-to-br'>
      {/* Header Skeleton */}
      <div className='border-border/40 bg-background/95 flex-none border-b p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-10 w-10 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-3 w-20' />
            </div>
          </div>
          <div className='flex gap-2'>
            <Skeleton className='h-8 w-8 rounded-full' />
            <Skeleton className='h-8 w-8 rounded-full' />
            <Skeleton className='h-8 w-8 rounded-full' />
          </div>
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className='flex-1 space-y-4 p-6'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            // biome-ignore lint: error
            key={i}
            className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
          >
            <div className='flex max-w-[75%] items-end gap-3'>
              {i % 2 === 0 && (
                <Skeleton className='h-8 w-8 flex-shrink-0 rounded-full' />
              )}
              <div className='space-y-2'>
                <Skeleton className='h-12 w-48 rounded-2xl' />
                <Skeleton className='ml-auto h-3 w-16' />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Skeleton */}
      <div className='border-border/40 bg-background/95 border-t p-4'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-8 w-8 rounded-full' />
          <Skeleton className='h-10 flex-1 rounded-full' />
          <Skeleton className='h-8 w-8 rounded-full' />
        </div>
      </div>
    </div>
  );
}
