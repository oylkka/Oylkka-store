'use client';

import {
  ChevronDown,
  Filter,
  Grid3x3,
  Heart,
  List,
  RefreshCw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  StarHalf,
  Store,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
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
  const { data, isPending, error } = useProductList();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('featured');
  const [selectedView, setSelectedView] = useState('grid');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Extract unique categories when data loads
  useEffect(() => {
    if (data?.products) {
      const categories = new Set<string>();
      data.products.forEach((product: Product) => {
        if (product.category) {
          categories.add(product.category);
        }
      });
      setAvailableCategories(Array.from(categories));
    }
  }, [data]);

  // Handle wishlist toggle
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };

  // Filter products based on search, category, and price
  const filteredProducts =
    data?.products?.filter((product: Product) => {
      const matchesSearch = product.productName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice =
        product.price >= priceRange[0] &&
        (product.discountPrice || product.price) <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    }) || [];

  // Sort products
  const sortedProducts = [...filteredProducts].sort(
    (a: Product, b: Product) => {
      switch (selectedSort) {
        case 'price-low':
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case 'price-high':
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        case 'newest':
          return new Date(b.id).getTime() - new Date(a.id).getTime();
        default:
          return 0;
      }
    }
  );

  // Loading state
  if (isPending) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8 flex justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="space-y-3">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
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
        <Button className="mt-4 gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Page
        </Button>
      </div>
    );
  }

  // Empty state
  if (!data?.products || data.products.length === 0) {
    return (
      <div className="container mx-auto flex h-96 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="rounded-full bg-amber-100 p-4">
          <Store className="h-8 w-8 text-amber-500" />
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
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-16 text-white">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-4xl font-bold">Shop Our Collection</h1>
          <p className="mb-6 max-w-lg text-blue-100">
            Discover our carefully curated products designed for quality, style,
            and functionality.
          </p>
          <div className="relative max-w-xl">
            <Input
              type="search"
              placeholder="Search for products..."
              className="border-0 bg-white/20 pr-10 text-white backdrop-blur-sm placeholder:text-blue-100 focus:ring-2 focus:ring-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-blue-100" />
          </div>
        </div>
        <div className="absolute right-0 bottom-0 left-0 h-16 bg-gradient-to-t from-slate-50/50 to-transparent" />
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Top controls */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="text-muted-foreground h-5 w-5" />
            <h3 className="font-medium">Filter:</h3>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">All Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full max-w-sm sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Shop Filters</SheetTitle>
                  <SheetDescription>
                    Narrow down products based on your preferences
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-180px)] pr-4">
                  <div className="py-6">
                    <h3 className="mb-3 font-medium">Categories</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="all"
                          checked={selectedCategory === 'all'}
                          onCheckedChange={() => setSelectedCategory('all')}
                        />
                        <label htmlFor="all" className="text-sm font-medium">
                          All Categories
                        </label>
                      </div>
                      {availableCategories.map((category) => (
                        <div
                          key={category}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={category}
                            checked={selectedCategory === category}
                            onCheckedChange={() =>
                              setSelectedCategory(category)
                            }
                          />
                          <label
                            htmlFor={category}
                            className="text-sm font-medium"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-6" />

                    <h3 className="mb-3 font-medium">Price Range</h3>
                    <div className="mb-6 space-y-4">
                      <Slider
                        defaultValue={[0, 1000]}
                        max={1000}
                        step={10}
                        value={priceRange}
                        onValueChange={setPriceRange}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          ${priceRange[0]}
                        </span>
                        <span className="text-sm font-medium">
                          ${priceRange[1]}
                        </span>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <h3 className="mb-3 font-medium">Product Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="in-stock" />
                        <label
                          htmlFor="in-stock"
                          className="text-sm font-medium"
                        >
                          In Stock Only
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="on-sale" />
                        <label
                          htmlFor="on-sale"
                          className="text-sm font-medium"
                        >
                          On Sale
                        </label>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <SheetFooter className="flex-row justify-between sm:justify-between">
                  <SheetClose asChild>
                    <Button variant="outline">Reset All</Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button>Apply Filters</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden items-center rounded-md border bg-white md:flex">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'rounded-none border-r',
                  selectedView === 'grid' ? 'bg-muted' : ''
                )}
                onClick={() => setSelectedView('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(selectedView === 'list' ? 'bg-muted' : '')}
                onClick={() => setSelectedView('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active filters */}
        {(selectedCategory !== 'all' ||
          searchQuery ||
          priceRange[0] > 0 ||
          priceRange[1] < 1000) && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Active Filters:</span>

            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1 px-3 py-1 text-sm">
                Category: {selectedCategory}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setSelectedCategory('all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {searchQuery && (
              <Badge variant="secondary" className="gap-1 px-3 py-1 text-sm">
                Search: {searchQuery}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {(priceRange[0] > 0 || priceRange[1] < 1000) && (
              <Badge variant="secondary" className="gap-1 px-3 py-1 text-sm">
                Price: ${priceRange[0]} - ${priceRange[1]}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setPriceRange([0, 1000])}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            <Button
              variant="ghost"
              className="text-sm font-medium text-blue-600"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceRange([0, 1000]);
              }}
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Results summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing{' '}
            <span className="text-foreground font-medium">
              {sortedProducts.length}
            </span>{' '}
            of {data.products.length} products
          </p>
        </div>

        {/* Products display */}
        {sortedProducts.length > 0 ? (
          selectedView === 'grid' ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {sortedProducts.map((product: Product) => {
                const imageUrl =
                  product.images?.[0]?.url || '/api/placeholder/400/500';
                const price = product.price;
                const discountPrice = product.discountPrice;
                const isWishlisted = wishlist.has(product.id);

                return (
                  <Card
                    key={product.id}
                    className="group overflow-hidden rounded-xl border p-0 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="relative">
                      {/* Product Image with Gradient Overlay */}
                      <div className="relative h-72 w-full overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={product.productName}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>

                      {/* Discount Badge */}
                      {product.discountPercent &&
                        product.discountPercent > 0 && (
                          <Badge className="absolute top-3 left-3 bg-red-500 px-2 py-1 font-medium text-white">
                            {product.discountPercent}% OFF
                          </Badge>
                        )}

                      {/* Wishlist Button */}
                      <Button
                        variant="secondary"
                        size="icon"
                        className={cn(
                          'absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 shadow-md backdrop-blur-sm transition-all',
                          isWishlisted
                            ? 'text-red-500'
                            : 'opacity-0 group-hover:opacity-100'
                        )}
                        onClick={() => toggleWishlist(product.id)}
                        aria-label="Add to wishlist"
                      >
                        <Heart
                          className={cn(
                            'h-4 w-4',
                            isWishlisted && 'fill-current'
                          )}
                        />
                      </Button>

                      {/* Quick Add Overlay - Appears on Hover */}
                      <div className="absolute right-0 bottom-0 left-0 translate-y-full bg-white/95 p-3 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
                        <Button className="w-full gap-2 font-medium">
                          <ShoppingBag className="h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-4 pt-10">
                      <div className="mb-2 flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="bg-slate-50 text-xs font-normal"
                        >
                          {product.category || 'Fashion'}
                        </Badge>

                        {product.stock !== undefined && product.stock < 10 && (
                          <Badge
                            variant="secondary"
                            className="bg-amber-50 text-xs text-amber-700"
                          >
                            {product.stock > 0
                              ? `Only ${product.stock} left`
                              : 'Out of stock'}
                          </Badge>
                        )}
                      </div>

                      {/* Product Rating */}
                      <div className="mb-2 flex items-center gap-1">
                        {[...Array(4)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                        <StarHalf className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-muted-foreground ml-1 text-xs">
                          4.5
                        </span>
                      </div>

                      <h3 className="mb-1 line-clamp-1 text-base font-medium">
                        {product.productName}
                      </h3>

                      <div className="mt-2 flex items-center gap-2">
                        {discountPrice ? (
                          <>
                            <span className="text-lg font-semibold text-red-600">
                              ${discountPrice.toFixed(2)}
                            </span>
                            <span className="text-muted-foreground text-sm line-through">
                              ${price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-semibold">
                            ${price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between p-4 pt-0">
                      <div className="text-muted-foreground text-xs">
                        {product.stock !== undefined && product.stock < 10
                          ? product.stock > 0
                            ? '🔥 Selling fast'
                            : '❌ Out of stock'
                          : '✓ In stock'}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-primary h-auto p-0 text-sm hover:bg-transparent"
                      >
                        Quick view
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            // List view
            <div className="space-y-4">
              {sortedProducts.map((product: Product) => {
                const imageUrl =
                  product.images?.[0]?.url || '/api/placeholder/400/500';
                const price = product.price;
                const discountPrice = product.discountPrice;
                const isWishlisted = wishlist.has(product.id);

                return (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative h-48 sm:h-auto sm:w-48 md:w-64">
                        <Image
                          src={imageUrl}
                          alt={product.productName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 200px"
                        />
                        {product.discountPercent &&
                          product.discountPercent > 0 && (
                            <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                              {product.discountPercent}% OFF
                            </Badge>
                          )}
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <Badge variant="outline">
                            {product.category || 'Fashion'}
                          </Badge>

                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-8 w-8',
                              isWishlisted && 'text-red-500'
                            )}
                            onClick={() => toggleWishlist(product.id)}
                          >
                            <Heart
                              className={cn(
                                'h-4 w-4',
                                isWishlisted && 'fill-current'
                              )}
                            />
                          </Button>
                        </div>

                        <h3 className="mb-1 line-clamp-1 text-xl font-medium">
                          {product.productName}
                        </h3>

                        <div className="mb-2 flex items-center gap-1">
                          {[...Array(4)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                          <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-muted-foreground ml-1 text-sm">
                            4.5
                          </span>
                        </div>

                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          High-quality product with premium materials. Perfect
                          for everyday use.
                        </p>

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {discountPrice ? (
                              <>
                                <span className="text-xl font-semibold text-red-600">
                                  ${discountPrice.toFixed(2)}
                                </span>
                                <span className="text-muted-foreground text-sm line-through">
                                  ${price.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-xl font-semibold">
                                ${price.toFixed(2)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              Quick View
                            </Button>
                            <Button size="sm" className="gap-2">
                              <ShoppingBag className="h-4 w-4" />
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )
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
                setPriceRange([0, 1000]);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination - if needed */}
        {sortedProducts.length > 0 && (
          <div className="mt-12 flex items-center justify-center gap-1">
            <Button variant="outline" size="icon" disabled>
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 font-medium"
            >
              1
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              2
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              3
            </Button>
            <span className="px-2">...</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              10
            </Button>
            <Button variant="outline" size="icon">
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
