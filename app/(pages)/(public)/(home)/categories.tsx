'use client';

import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import Link from 'next/link';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import type { CategoriesType } from '@/lib/types';
import { useProductCategories } from '@/services';

export default function Categories() {
  const { isPending, data: categories, isError } = useProductCategories();

  if (isPending) {
    return <CategoriesSkeleton />;
  }

  if (isError) {
    return (
      <div className='w-full p-8 text-center'>
        <h3 className='text-xl font-semibold text-red-500'>
          Failed to load categories
        </h3>
        <p className='mt-2 text-gray-500'>Please try again later</p>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-2 py-8 md:px-0 md:py-12'>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 3000,
          }),
        ]}
        className='w-full'
      >
        <CarouselContent className='-ml-2 md:-ml-4'>
          {categories.map((category: CategoriesType) => (
            <CarouselItem
              key={category.slug}
              className='basis-1/3 pl-2 md:basis-1/3 md:pl-4 lg:basis-1/4'
            >
              <Link
                href={`/products?category=${category.slug}`}
                className='group relative block overflow-hidden rounded-lg'
              >
                <div className='bg-muted aspect-[3/4] w-full overflow-hidden rounded-lg md:aspect-[3/4]'>
                  <Image
                    src={category.image.url}
                    alt={category.image.alt}
                    width={300}
                    height={400}
                    className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent' />
                  <div className='absolute right-0 bottom-0 left-0 p-4'>
                    <h3 className='text-lg font-semibold text-white md:text-xl'>
                      {category.name}
                    </h3>
                    <p className='mt-1 line-clamp-2 hidden translate-y-2 text-sm text-white/80 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block'>
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

function CategoriesSkeleton() {
  // Create an array of 8 items to represent loading categories
  const skeletonItems = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className='container mx-auto px-2 py-8 md:px-0 md:py-12'>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 3000,
          }),
        ]}
        className='w-full'
      >
        <CarouselContent className='-ml-2 md:-ml-4'>
          {skeletonItems.map((index) => (
            <CarouselItem
              key={index}
              className='basis-full pl-2 sm:basis-1/2 md:basis-1/3 md:pl-4 lg:basis-1/4'
            >
              <div className='group relative block overflow-hidden rounded-lg'>
                <div className='bg-muted aspect-[3/4] w-full overflow-hidden rounded-lg'>
                  <Skeleton className='h-full w-full' />
                  <div className='absolute right-0 bottom-0 left-0 p-4'>
                    <Skeleton className='mb-2 h-6 w-3/4' />
                    <Skeleton className='h-4 w-full' />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
