'use client';

import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductList } from '@/service/product-list';

import ProductHeader, { ProductHeaderSkeleton } from './product-header';

// Rest of your interfaces and code...

interface FilterOptions {
  search?: string;
  color?: string;
  size?: string;
  sortby?: string;
  minPrice?: string;
  maxPrice?: string;
}
interface Product {
  id: string;
  productName: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  category: string;
  subcategory: string;
  discountPercent: number | null;
  images: { url: string }[];
}

function ShopContent() {
  // State to store filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});

  // Get URL search parameters
  const searchParams = useSearchParams();

  // Update filters whenever URL parameters change
  useEffect(() => {
    const options: FilterOptions = {};

    // Get all relevant filter parameters directly from searchParams
    const search = searchParams.get('search') || '';
    const color = searchParams.get('color') || '';
    const size = searchParams.get('size') || '';
    const sortby = searchParams.get('sortby') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    // Only add parameters that exist
    if (search) {
      options.search = search;
    }
    if (color) {
      options.color = color;
    }
    if (size) {
      options.size = size;
    }
    if (sortby) {
      options.sortby = sortby;
    }
    if (minPrice) {
      options.minPrice = minPrice;
    }
    if (maxPrice) {
      options.maxPrice = maxPrice;
    }

    // Update filter options state
    setFilterOptions(options);
  }, [searchParams]); // Only depend on searchParams, not on getParam

  // Pass filter options to the useProductList hook
  const { isPending, data, isError } = useProductList(filterOptions);

  if (isPending) {
    return (
      <div className="container mx-auto py-8">
        <ProductHeaderSkeleton />
        <div className="mb-6 flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto flex h-64 items-center justify-center">
        <div className="text-center">
          <h3 className="text-destructive mb-2 text-lg font-medium">
            Oops! Something went wrong
          </h3>
          <p className="text-muted-foreground mb-4">
            We couldn&#39;t load the products at this moment
          </p>
          <Button variant="outline">Try Again</Button>
        </div>
      </div>
    );
  }

  // Display filter summary if filters are applied
  const hasActiveFilters = Object.keys(filterOptions).length > 0;

  // Helper function to format filter summary
  const getFilterSummary = () => {
    const parts = [];

    if (filterOptions.search) {
      parts.push(`"${filterOptions.search}"`);
    }
    if (filterOptions.color) {
      parts.push(`Color: ${filterOptions.color}`);
    }
    if (filterOptions.size) {
      parts.push(`Size: ${filterOptions.size}`);
    }
    if (filterOptions.minPrice || filterOptions.maxPrice) {
      const priceRange = [];
      if (filterOptions.minPrice) {
        priceRange.push(`$${filterOptions.minPrice}`);
      }
      if (filterOptions.minPrice && filterOptions.maxPrice) {
        priceRange.push('-');
      }
      if (filterOptions.maxPrice) {
        priceRange.push(`$${filterOptions.maxPrice}`);
      }
      parts.push(`Price: ${priceRange.join(' ')}`);
    }

    return parts.join(' • ');
  };

  return (
    <div className="container mx-auto py-8">
      <ProductHeader />

      {/* Filter summary */}
      {hasActiveFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Filtered by:</span>
          <div className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs">
            {getFilterSummary()}
          </div>

          {filterOptions.sortby && (
            <div className="ml-auto flex items-center gap-1">
              <span className="text-sm font-medium">Sorted by:</span>
              <span className="text-sm">
                {filterOptions.sortby === 'priceLow' && 'Price: Low to High'}
                {filterOptions.sortby === 'priceHigh' && 'Price: High to Low'}
                {filterOptions.sortby === 'new' && 'Newest'}
                {filterOptions.sortby === 'popular' && 'Popular'}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {data.products.map((product: Product) => (
          <Card
            key={product.id}
            className="group overflow-hidden p-0 transition hover:shadow-md"
          >
            <div className="bg-muted relative aspect-square overflow-hidden">
              <Image
                src={product.images[0].url}
                alt={product.productName}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {product.discountPercent && (
                <Badge className="bg-primary absolute top-2 left-2 text-white">
                  -{product.discountPercent}%
                </Badge>
              )}
              <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CardContent className="space-y-3 px-4">
              <div className="text-muted-foreground flex items-center justify-between text-xs uppercase">
                <span>{product.subcategory}</span>
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="h-3 w-3 fill-current" />
                  4.7
                </span>
              </div>
              <h3 className="group-hover:text-primary mb-2 line-clamp-2 leading-tight font-medium">
                {product.productName}
              </h3>
              <div className="flex items-center gap-2">
                {product.discountPrice ? (
                  <>
                    <span className="text-primary text-base font-bold">
                      ${product.discountPrice}
                    </span>
                    <span className="text-muted-foreground text-xs line-through">
                      ${product.price}
                    </span>
                  </>
                ) : (
                  <span className="text-primary text-base font-bold">
                    ${product.price}
                  </span>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between gap-2 border-t p-3 pt-0">
              <Button
                variant="secondary"
                size="sm"
                className="text-muted-foreground hover:text-primary transition-all"
              >
                <Eye className="h-4 w-4" />
                View
              </Button>

              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 gap-2 text-white transition-all"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {data.products.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            No products found with the current filters.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              // Clear all filters by navigating to page without query params
              window.location.href = window.location.pathname;
            }}
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ShopContent />
    </Suspense>
  );
}
// Product skeleton for loading state
const ProductSkeleton = () => (
  <Card className="bg-card overflow-hidden rounded-lg border-0 shadow-sm transition hover:shadow-md">
    <div className="bg-muted relative aspect-square overflow-hidden">
      <Skeleton className="h-full w-full" />
    </div>
    <CardContent className="p-4 pt-4">
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="mb-3 h-5 w-1/2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-10" />
      </div>
    </CardContent>
  </Card>
);
