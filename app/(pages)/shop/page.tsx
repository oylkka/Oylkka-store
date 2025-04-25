'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductList } from '@/services';
import { ProductCardType } from '@/types';

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.products.map((product: ProductCardType) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
      <ShopContent />;
    </Suspense>
  );
}
