'use client';

import { Package } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCardType } from '@/lib/types';
import { useProductList } from '@/services';

import ProductListPagination from './pagination';
import { ProductCard, ProductCardSkeleton } from './product-card';
import ProductHeader, { ProductHeaderSkeleton } from './product-header';

const LoadingState = () => (
  <div className="container mx-auto py-8">
    <ProductHeaderSkeleton />
    <div className="mb-6 flex justify-end">
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

const ErrorState = () => (
  <div className="container mx-auto flex h-64 items-center justify-center">
    <div className="text-center">
      <h3 className="text-destructive mb-2 text-lg font-medium">
        Oops! Something went wrong
      </h3>
      <p className="text-muted-foreground mb-4">
        We couldn&apos;t load the products at this moment.
      </p>
      <Button variant="outline">Try Again</Button>
    </div>
  </div>
);

function ShopContent() {
  const searchParams = useSearchParams();
  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const { isPending, data, isError } = useProductList({ currentPage: page });
  const router = useRouter();

  if (isPending) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState />;
  }

  return (
    <Suspense
      fallback={
        <div className="container mx-auto grid grid-cols-2 gap-4 py-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      }
    >
      <div className="container mx-auto my-4 space-y-12">
        <ProductHeader totalProducts={data.pagination.total} />

        {data.products.length === 0 ? (
          <div className="container mx-auto py-12">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <div className="bg-muted rounded-full p-3">
                <Package className="text-muted-foreground h-10 w-10" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                No products available
              </h3>
              <p className="text-muted-foreground mt-2 max-w-md text-sm">
                We couldn&apos;t find any products matching your criteria. Try
                adjusting your filters or check back later for new arrivals.
              </p>
              <div className="mt-6 flex gap-4">
                <Button variant="outline" onClick={() => router.push('/')}>
                  Back to Home
                </Button>
                <Button variant="secondary" onClick={() => router.refresh()}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
