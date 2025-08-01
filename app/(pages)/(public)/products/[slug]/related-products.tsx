'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProductCardType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRelatedProduct } from '@/services';

import { ProductCard } from '../product-card';

export default function RelatedProducts({ slug }: { slug: string }) {
  const { isPending, data, isError } = useRelatedProduct({ slug });

  if (isPending) {
    return (
      <div className='mt-16'>
        <div className='mb-8 flex items-center justify-between'>
          <h2 className='text-2xl font-semibold tracking-tight'>
            You May Also Like
          </h2>
        </div>
        <div className='relative px-4'>
          <Carousel className='w-full'>
            <CarouselContent>
              {[1, 2, 3, 4].map((i) => (
                <CarouselItem
                  key={i}
                  className={cn(
                    'basis-full pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4',
                  )}
                >
                  <div className='overflow-hidden rounded-xl bg-white'>
                    <div className='relative aspect-[4/5] w-full overflow-hidden rounded-t-xl'>
                      <Skeleton className='h-full w-full' />
                    </div>
                    <div className='p-4'>
                      <Skeleton className='mb-2 h-4 w-20' />
                      <Skeleton className='mb-3 h-5 w-3/4' />
                      <Skeleton className='mb-4 h-5 w-1/3' />
                      <div className='flex items-center justify-between'>
                        <Skeleton className='h-8 w-16' />
                        <Skeleton className='h-8 w-8 rounded-full' />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    );
  }

  if (isError || !data?.products || data.products.length === 0) {
    return null;
  }

  return (
    <div className='mt-16'>
      <div className='mb-8 flex items-center justify-between'>
        <h2 className='text-2xl font-semibold tracking-tight'>
          You May Also Like
        </h2>
      </div>

      <div className='relative px-4'>
        <Carousel
          className='w-full'
          opts={{
            align: 'start',
            loop: data.products.length > 4,
          }}
        >
          <CarouselContent>
            {data.products.map((product: ProductCardType) => (
              <CarouselItem
                key={product.id}
                className={cn(
                  'basis-full pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4',
                )}
              >
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className='absolute top-1/2 -right-2 -translate-y-1/2'>
            <CarouselNext className='h-10 w-10 rounded-full border-0 bg-white shadow-lg hover:bg-gray-50' />
          </div>
          <div className='absolute top-1/2 -left-2 -translate-y-1/2'>
            <CarouselPrevious className='h-10 w-10 rounded-full border-0 bg-white shadow-lg hover:bg-gray-50' />
          </div>
        </Carousel>
      </div>
    </div>
  );
}
