'use client';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCardType } from '@/lib/types';
import { useProductList } from '@/services';

import { ProductCard, ProductCardSkeleton } from '../products/product-card';

export default function RecentProducts() {
  const { isPending, data, isError } = useProductList({ currentPage: 1 });

  if (isPending) {
    return (
      <div className="container mx-auto py-8">
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
  }

  if (isError || !data) {
    return (
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
  }
  return (
    <div className="container mx-auto my-4 space-y-12 md:my-10">
      <h2 className="text-2xl font-bold">Recent Products</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {data.products.map((product: ProductCardType) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {data.products.length > 15 && (
        <Link href="/products" className="flex items-center justify-center">
          <Button size="lg">View All Products</Button>
        </Link>
      )}
    </div>
  );
}
