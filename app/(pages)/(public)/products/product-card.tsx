'use client';

import { Heart, ShoppingBag, Star, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCardType } from '@/lib/types';
// import { useAddToCart } from '@/services';

export function ProductCard({ product }: { product: ProductCardType }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  // const { mutate: addToCart, isPending } = useAddToCart();
  // const handleAddToCart = () => {
  //   addToCart({
  //     productId: product.id,
  //   });
  // };

  // Calculate the final price
  const finalPrice = product.discountPrice || product.price;

  return (
    <Card className="group hover:border-primary/20 relative h-full overflow-hidden rounded-xl border border-gray-100 bg-white p-0 transition-all duration-300 hover:shadow-lg">
      {/* Wishlist button (positioned absolutely) */}
      <button
        onClick={() => setIsWishlisted(!isWishlisted)}
        className="absolute top-3 right-3 z-20 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all hover:bg-white"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
        />
      </button>

      {/* Product image with zoom effect */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <Link href={`/products/${product.slug}`}>
          <div className="h-full w-full overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.productName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
        </Link>

        {/* Discount badge */}
        {product.discountPercent > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-primary px-2 py-1 text-xs font-medium text-white">
              {product.discountPercent}% OFF
            </Badge>
          </div>
        )}
      </div>

      {/* Product content section */}
      <CardContent className="flex flex-col gap-3 p-4">
        {/* Category and rating */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="bg-gray-50 text-xs font-normal text-gray-600"
          >
            {product.category.name}
          </Badge>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-xs font-medium">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        {/* Product title */}
        <Link href={`/shop/single-product?productId=${product.id}`}>
          <h3 className="hover:text-primary line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-900 transition-colors">
            {product.productName}
          </h3>
        </Link>

        {/* Price display */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ৳{finalPrice.toFixed(2)}
          </span>
          {product.discountPrice && (
            <span className="text-sm text-gray-400 line-through">
              ৳{product.price.toFixed(2)}
            </span>
          )}

          {/* Free shipping tag */}
          {product.freeShipping && (
            <Badge
              variant="outline"
              className="ml-auto border-green-100 bg-green-50 text-xs font-normal text-green-600"
            >
              <Truck className="mr-1 h-3 w-3" />
              Free Shipping
            </Badge>
          )}
        </div>

        {/* Cart and wishlist actions */}
        <div className="mt-1 flex items-center gap-2">
          {/* Wishlist button (alternative position) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`h-9 w-9 rounded-full p-0 ${
              isWishlisted
                ? 'border-red-200 bg-red-50 text-red-500'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            <Heart
              className={`h-4 w-4 ${isWishlisted ? 'fill-red-500' : ''}`}
            />
          </Button>

          {/* Add to cart button - more subtle now */}
          <Button
            variant="outline"
            size="sm"
            // onClick={handleAddToCart}
            // disabled={isPending}
            className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary h-9 flex-1 cursor-pointer text-xs font-medium"
          >
            <ShoppingBag className="mr-1 h-3 w-3" />{' '}
            {/* {isPending ? 'Adding...' : 'Add to Cart'} */}
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden rounded-xl border p-0">
      {/* Image skeleton */}
      <div className="relative aspect-square w-full bg-gray-50">
        <Skeleton className="absolute inset-0 h-full w-full" />
        <div className="absolute top-3 left-3 z-10">
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="absolute top-3 right-3 z-10">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>

        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />

        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="ml-auto h-5 w-24 rounded-full" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
