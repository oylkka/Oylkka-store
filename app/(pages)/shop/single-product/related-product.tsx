'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useRelatedProduct } from '@/service/product-list';
import { Eye, Heart, ShoppingBag, Star, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface Product {
  id: string;
  productName: string;
  description: string;
  price: number;
  discountPrice?: number;
  discountPercent: number;
  sku: string;
  category: string;
  subcategory: string;
  brand: string;
  condition: string;
  stock: number;
  lowStockAlert: number;
  freeShipping: boolean;
  imageUrl: string;
  rating: number;
}

export default function RelatedProducts({ id }: { id: string }) {
  const { isPending, data, isError } = useRelatedProduct({ id });

  if (isPending) {
    return (
      <div className="mt-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            You May Also Like
          </h2>
        </div>
        <div className="relative px-4">
          <Carousel className="w-full">
            <CarouselContent>
              {[1, 2, 3, 4].map((i) => (
                <CarouselItem
                  key={i}
                  className={cn(
                    'basis-full pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4'
                  )}
                >
                  <div className="overflow-hidden rounded-xl bg-white">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-xl">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <div className="p-4">
                      <Skeleton className="mb-2 h-4 w-20" />
                      <Skeleton className="mb-3 h-5 w-3/4" />
                      <Skeleton className="mb-4 h-5 w-1/3" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-8 rounded-full" />
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
    <div className="mt-16">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          You May Also Like
        </h2>
      </div>

      <div className="relative px-4">
        <Carousel
          className="w-full"
          opts={{
            align: 'start',
            loop: data.products.length > 4,
          }}
        >
          <CarouselContent>
            {data.products.map((product: Product) => (
              <CarouselItem
                key={product.id}
                className={cn(
                  'basis-full pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4'
                )}
              >
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute top-1/2 -right-2 -translate-y-1/2">
            <CarouselNext className="h-10 w-10 rounded-full border-0 bg-white shadow-lg hover:bg-gray-50" />
          </div>
          <div className="absolute top-1/2 -left-2 -translate-y-1/2">
            <CarouselPrevious className="h-10 w-10 rounded-full border-0 bg-white shadow-lg hover:bg-gray-50" />
          </div>
        </Carousel>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Card
      className="group h-full overflow-hidden p-0 transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-xl">
        <Link href={`/shop/single-product?productId=${product.id}`}>
          <Image
            src={product.imageUrl}
            alt={product.productName}
            fill
            className={cn(
              'object-cover transition-transform duration-700',
              isHovering ? 'scale-110' : 'scale-100'
            )}
          />
        </Link>

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary px-2 py-1 text-xs font-medium text-white">
              {product.discountPercent}% OFF
            </Badge>
          </div>
        )}

        {/* Actions Overlay */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition-opacity duration-300',
            isHovering ? 'opacity-100' : ''
          )}
        >
          <div className="flex gap-2">
            <Link href={`/shop/single-product?productId=${product.id}`}>
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 rounded-full bg-white shadow-md hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full bg-white shadow-md hover:bg-gray-50"
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-colors',
                  isHovering ? 'text-red-500' : ''
                )}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        {product.freeShipping && (
          <div className="mb-2 flex items-center gap-2">
            <Truck className="h-4 w-4 text-green-500" />
            <span className="text-xs font-medium tracking-wider text-green-500">
              Free Shipping
            </span>
          </div>
        )}
        {/* Category & Rating */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            {product.subcategory}
          </span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-medium">
              {product.rating || '4.7'}
            </span>
          </div>
        </div>

        {/* Product Name */}
        <Link href={`/shop/single-product?productId=${product.id}`}>
          <h3 className="hover:text-primary mb-2 line-clamp-2 min-h-[2.5rem] leading-tight font-medium transition-colors">
            {product.productName}
          </h3>
        </Link>

        {/* Price */}
        <div className="mb-4 flex items-baseline gap-2">
          {product.discountPrice ? (
            <>
              <span className="text-base font-bold text-black">
                ${product.discountPrice.toFixed(2)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-base font-bold text-black">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <div className="flex items-center justify-between">
          <Button variant="outline">
            <Heart className="mr-2 h-4 w-4" />
            Wishlist
          </Button>
          <Button>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
}
