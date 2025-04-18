'use client';

import { Search, ShoppingBag, SlidersHorizontal, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductList } from '@/service/product-list';

type Product = {
  id: string;
  productName: string;
  price: number;
  discountPrice?: number | null;
  discountPercent?: number | null;
  stock?: number;
  status?: string;
  category?: string;
  subcategory?: string;
  images: { url: string }[];
};

export default function ShopPage() {
  const { data: productsData, isLoading, error } = useProductList();
  const products: Product[] = productsData?.products || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('featured');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (selectedSort === 'price-low') {
      const priceA = a.discountPrice !== null ? a.discountPrice : a.price;
      const priceB = b.discountPrice !== null ? b.discountPrice : b.price;
      return (priceA || 0) - (priceB || 0);
    } else if (selectedSort === 'price-high') {
      const priceA = a.discountPrice !== null ? a.discountPrice : a.price;
      const priceB = b.discountPrice !== null ? b.discountPrice : b.price;
      return (priceB || 0) - (priceA || 0);
    }
    return 0; // Default: featured
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8 flex justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Skeleton key={idx} className="h-96 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto flex h-96 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="rounded-full bg-red-100 p-4">
          <X className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md">
          We couldn&#39;t load the products. Please try again later.
        </p>
        <Button className="mt-4">Refresh Page</Button>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="container mx-auto flex h-96 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="rounded-full bg-amber-100 p-4">
          <ShoppingBag className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold">No products found</h2>
        <p className="text-muted-foreground max-w-md">
          We couldn&#39;t find any products matching your criteria.
        </p>
        <Button className="mt-4" variant="outline">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Page header with search and filter controls */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Shop Collection
            </h2>
            <p className="text-muted-foreground mt-1">
              {sortedProducts.length} products available
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 md:w-64 md:flex-none">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Narrow down products based on your preferences
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                  <h3 className="mb-2 font-medium">Categories</h3>

                  <Separator className="my-6" />

                  <h3 className="mb-2 font-medium">Price Range</h3>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="Min" />
                    <Input type="number" placeholder="Max" />
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button>Apply Filters</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active filters */}
        {selectedCategory !== 'all' && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1 px-3 py-1 text-sm">
              {selectedCategory.charAt(0).toUpperCase() +
                selectedCategory.slice(1)}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => setSelectedCategory('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        )}

        {/* Products grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sortedProducts.map((product) => {
              const imageUrl =
                product.images?.[0]?.url || '/api/placeholder/400/500';
              const price = product.price;
              const discountPrice = product.discountPrice;

              return (
                <Card
                  key={product.id}
                  className="group relative overflow-hidden rounded-xl border-none shadow-md transition-all hover:shadow-xl"
                >
                  {/* Discount Badge */}
                  {product.discountPercent && (
                    <div className="absolute top-3 left-3 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                      {product.discountPercent}% OFF
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/80 opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover:opacity-100"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.5 13.5L7.1 13.1C3.4 9.7 1 7.5 1 4.9C1 2.7 2.7 1 4.9 1C5.9 1 6.9 1.4 7.5 2C8.1 1.4 9.1 1 10.1 1C12.3 1 14 2.7 14 4.9C14 7.5 11.6 9.7 7.9 13.1L7.5 13.5Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>

                  {/* Product Image */}
                  <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={imageUrl}
                      alt={product.productName}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>

                  {/* Content */}
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-slate-50">
                        {product.category || 'Fashion'}
                      </Badge>
                      {product.stock && product.stock < 10 && (
                        <Badge
                          variant="secondary"
                          className="bg-amber-50 text-amber-700"
                        >
                          Low Stock
                        </Badge>
                      )}
                    </div>

                    <h3 className="line-clamp-1 text-lg font-medium">
                      {product.productName}
                    </h3>

                    <div className="flex items-center gap-2">
                      {discountPrice ? (
                        <>
                          <span className="text-lg font-medium text-red-600">
                            ${discountPrice.toFixed(2)}
                          </span>
                          <span className="text-muted-foreground text-sm line-through">
                            ${price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-medium">
                          ${price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="group/btn w-full gap-2"
                      // onClick={() => addToCart(product)}
                    >
                      <ShoppingBag className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <p className="text-muted-foreground mb-4 text-lg">
              No products match your search criteria.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
