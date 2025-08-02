'use client';
import { Package } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ProductListPagination from '@/app/(pages)/(public)/products/pagination';
import {
  ProductCard,
  ProductCardSkeleton,
} from '@/app/(pages)/(public)/products/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProductCardType } from '@/lib/types';
import { useVendorProducts } from '@/services/vendor/product';
import ProductHeader, { ProductHeaderSkeleton } from './product-header';

const LoadingState = () => (
  <div className='container mx-auto py-8'>
    <ProductHeaderSkeleton />
    <div className='mb-6 flex justify-end'>
      <Skeleton className='h-10 w-32' />
    </div>
    <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4'>
      {Array.from({ length: 8 }).map((_, i) => (
        // biome-ignore lint: error
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

const ErrorState = () => (
  <div className='container mx-auto flex h-64 items-center justify-center'>
    <div className='text-center'>
      <h3 className='text-destructive mb-2 text-lg font-medium'>
        Oops! Something went wrong
      </h3>
      <p className='text-muted-foreground mb-4'>
        We couldn&apos;t load the products at this moment.
      </p>
      <Button variant='outline'>Try Again</Button>
    </div>
  </div>
);

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract all filter parameters from URL
  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const searchQuery = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const minPrice = searchParams.get('minPrice')
    ? Number(searchParams.get('minPrice'))
    : undefined;
  const maxPrice = searchParams.get('maxPrice')
    ? Number(searchParams.get('maxPrice'))
    : undefined;
  const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
  const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];

  const { isPending, data, isError } = useVendorProducts({
    currentPage: page,
    search: searchQuery,
    category,
    sortBy,
    minPrice,
    maxPrice,
    sizes,
    colors,
  });

  if (isPending) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState />;
  }

  const hasActiveFilters =
    category ||
    sortBy ||
    minPrice ||
    maxPrice ||
    sizes.length > 0 ||
    colors.length > 0;

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    // Keep only the search parameter if it exists
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Suspense
      fallback={
        <div className='container mx-auto grid grid-cols-2 gap-4 py-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint: error
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      }
    >
      <div className='container mx-auto my-4 space-y-12'>
        <ProductHeader totalProducts={data.pagination.total} />

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className='flex flex-wrap items-center gap-2 px-4 md:px-0'>
            <span className='text-muted-foreground text-sm font-medium'>
              Active filters:
            </span>
            {category && category !== 'All' && (
              <span className='bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'>
                Category: {category}
              </span>
            )}
            {sortBy && (
              <span className='bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'>
                Sort: {sortBy}
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className='bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'>
                Price: ৳{minPrice || 0} - ৳{maxPrice || '∞'}
              </span>
            )}
            {sizes.length > 0 && (
              <span className='bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'>
                Sizes: {sizes.join(', ')}
              </span>
            )}
            {colors.length > 0 && (
              <span className='bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'>
                Colors: {colors.join(', ')}
              </span>
            )}
            <Button
              variant='ghost'
              size='sm'
              onClick={clearAllFilters}
              className='h-6 px-2 text-xs'
            >
              Clear all
            </Button>
          </div>
        )}

        {data.products.length === 0 ? (
          <div className='container mx-auto py-12'>
            <div className='flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center'>
              <div className='bg-muted rounded-full p-3'>
                <Package className='text-muted-foreground h-10 w-10' />
              </div>
              <h3 className='mt-4 text-lg font-semibold'>
                {searchQuery ? 'No products found' : 'No products available'}
              </h3>
              <p className='text-muted-foreground mt-2 max-w-md text-sm'>
                {searchQuery
                  ? `We couldn't find any products matching "${searchQuery}". Try different keywords or check your spelling.`
                  : "We couldn't find any products matching your criteria. Try adjusting your filters or check back later for new arrivals."}
              </p>
              <div className='mt-6 flex gap-4'>
                <Button variant='outline' onClick={() => router.push('/')}>
                  Back to Home
                </Button>
                <Button
                  variant='secondary'
                  onClick={() => {
                    const params = new URLSearchParams();
                    router.push(`?${params.toString()}`);
                  }}
                >
                  Clear {searchQuery ? 'Search' : 'Filters'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
            {data.products.map((product: ProductCardType) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        {data.pagination.totalPages > 1 && (
          <ProductListPagination
            totalPages={data.pagination.totalPages}
            currentPage={data.pagination.currentPage}
          />
        )}
      </div>
    </Suspense>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ShopContent />
    </Suspense>
  );
}
