'use client';

import { Heart, ShoppingBag, ShoppingCart, Star, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProductCardType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAddToCart } from '@/services';
import { useToggleWishlist } from '@/services/customer/wishlist';

export function ProductCard({ product }: { product: ProductCardType }) {
  const { mutate: toggleWishlist, isPending: isWishlistPending } =
    useToggleWishlist();
  const { mutate: addToCart, isPending: isCartPending } = useAddToCart();
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleAddToCart = () => {
    if (status === 'loading') {
      return;
    }

    if (!session) {
      router.push('/sign-in');
      return;
    }

    addToCart({
      productId: product.id,
    });
  };

  const handleBuyNow = () => {
    if (status === 'loading') {
      return;
    }

    if (!session) {
      router.push('/sign-in');
      return;
    }

    addToCart(
      {
        productId: product.id,
      },
      {
        onSuccess: () => {
          toast.success('Product added to cart');
        },
      },
    );
  };

  const handleWishlistToggle = () => {
    if (status === 'loading') {
      return;
    }

    if (!session) {
      router.push('/sign-in');
      return;
    }

    toggleWishlist({ productId: product.id });
  };

  return (
    <Card className='group relative h-full overflow-hidden rounded pt-0 pb-2 transition-all duration-300 hover:shadow-md md:rounded-lg md:pb-4'>
      {/* Wishlist button (positioned absolutely) */}
      <Button
        variant='ghost'
        size='icon'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleWishlistToggle();
        }}
        disabled={isWishlistPending}
        className='bg-background/80 hover:bg-background absolute top-2 right-2 z-20 h-7 w-7 rounded-full p-0 shadow-sm backdrop-blur-sm transition-all sm:top-3 sm:right-3 sm:h-8 sm:w-8'
        aria-label={
          product.isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
        }
      >
        <Heart
          className={cn(
            'h-3.5 w-3.5 transition-colors sm:h-4 sm:w-4',
            product.isWishlisted
              ? 'fill-destructive text-destructive'
              : 'text-muted-foreground',
          )}
        />
      </Button>

      {/* Product image with zoom effect */}
      <div className='bg-muted relative aspect-square w-full overflow-hidden'>
        <Link href={`/products/${product.slug}`}>
          <div className='h-full w-full overflow-hidden'>
            <Image
              src={product.imageUrl || '/placeholder.svg'}
              alt={product.productName}
              fill
              sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw'
              className='object-cover transition-transform duration-700 group-hover:scale-110'
              priority={false}
            />
          </div>
        </Link>

        {/* Discount badge */}
        {product.discountPercent > 0 && (
          <div className='absolute top-2 left-2 z-10 sm:top-3 sm:left-3'>
            <Badge className='px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:py-1 sm:text-xs'>
              {product.discountPercent}% OFF
            </Badge>
          </div>
        )}
      </div>

      {/* Product content section */}
      <CardContent className='flex flex-col gap-2 px-2 sm:gap-3 sm:px-4'>
        {/* Category and rating */}
        <div className='flex items-center justify-between'>
          <Badge
            variant='secondary'
            className='px-1.5 py-0.5 text-[10px] font-normal sm:text-xs'
          >
            {product.category.name}
          </Badge>
          <div className='flex items-center gap-1 text-amber-500'>
            <Star className='h-3 w-3 fill-current' />
            <span className='text-[10px] font-medium sm:text-xs'>
              {product.rating.toFixed(1)}
            </span>
            <span className='text-muted-foreground text-[10px] sm:text-xs'>
              ({product.reviewCount})
            </span>
          </div>
        </div>

        {/* Product title */}
        <Link
          href={`/products/${product.slug}`}
          className='group-hover:text-primary'
        >
          <h3 className='text-card-foreground line-clamp-2 text-xs font-medium transition-colors sm:text-sm'>
            {product.productName}
          </h3>
        </Link>

        {/* Price display */}
        <div className='flex flex-wrap items-center gap-1.5 sm:gap-2'>
          <span className='text-card-foreground text-base font-bold sm:text-lg'>
            ৳{product.discountPrice || product.price}
          </span>
          {product.discountPrice && (
            <span className='text-muted-foreground text-xs line-through sm:text-sm'>
              ৳{product.price}
            </span>
          )}

          {/* Free shipping tag - hide on very small screens */}
          {product.freeShipping && (
            <Badge
              variant='outline'
              className='xs:inline-flex ml-auto hidden border-green-100 bg-green-50 px-1.5 py-0.5 text-[10px] font-normal text-green-600 sm:text-xs'
            >
              <Truck className='mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3' />
              Free Shipping
            </Badge>
          )}
        </div>

        {/* Free shipping indicator for very small screens */}
        {product.freeShipping && (
          <div className='xs:hidden flex'>
            <span className='text-[10px] font-medium text-green-600'>
              <Truck className='mr-1 inline-block h-2.5 w-2.5' />
              Free Shipping
            </span>
          </div>
        )}

        {/* Cart and Buy Now actions */}
        <div className='mt-1 flex items-center gap-1.5 sm:gap-2'>
          <div className='flex w-full gap-1.5'>
            {/* Add to cart button */}
            <Button
              variant='outline'
              size='sm'
              onClick={handleAddToCart}
              disabled={
                product.stock <= 0 || isCartPending || status === 'loading'
              }
              className={cn(
                'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 h-8 flex-1 text-[10px] font-medium sm:h-9 sm:text-xs',
                isCartPending && 'opacity-70',
              )}
            >
              {isCartPending ? (
                <span className='flex items-center'>
                  {/* biome-ignore lint: error */}
                  <svg
                    className='mr-2 h-3 w-3 animate-spin'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                      fill='none'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  Adding...
                </span>
              ) : (
                <>
                  <ShoppingBag className='mr-1 h-3 w-3' />
                  {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </Button>

            {/* Buy Now button */}
            <Button
              variant='default'
              size='sm'
              onClick={handleBuyNow}
              disabled={
                product.stock <= 0 || isCartPending || status === 'loading'
              }
              className={cn(
                'h-8 flex-1 text-[10px] font-medium sm:h-9 sm:text-xs',
                isCartPending && 'opacity-70',
              )}
            >
              {isCartPending ? (
                <span className='flex items-center'>
                  {/* biome-ignore lint: error */}
                  <svg
                    className='mr-2 h-3 w-3 animate-spin'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                      fill='none'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className='flex items-center justify-center'>
                  <ShoppingCart className='mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5' />
                  <span className='hidden sm:inline'>Buy Now</span>
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Stock indicator */}
        {product.stock <= 0 && (
          <div className='bg-background/10 absolute inset-0 flex items-center justify-center backdrop-blur-[1px]'>
            <Badge
              variant='secondary'
              className='bg-background/80 px-3 py-1.5 text-xs font-medium'
            >
              Out of Stock
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className='border-border bg-card h-full overflow-hidden p-0'>
      {/* Image skeleton */}
      <div className='bg-muted relative aspect-square w-full'>
        <Skeleton className='absolute inset-0 h-full w-full' />
        <div className='absolute top-2 left-2 z-10 sm:top-3 sm:left-3'>
          <Skeleton className='h-4 w-12 rounded-full sm:h-5 sm:w-16' />
        </div>
        <div className='absolute top-2 right-2 z-10 sm:top-3 sm:right-3'>
          <Skeleton className='h-6 w-6 rounded-full sm:h-8 sm:w-8' />
        </div>
      </div>

      {/* Content skeleton */}
      <CardContent className='space-y-2 p-3 sm:space-y-3 sm:p-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-4 w-16 rounded-full sm:h-5 sm:w-20' />
          <Skeleton className='h-3 w-12 rounded-md sm:h-4 sm:w-16' />
        </div>

        <Skeleton className='h-3 w-full sm:h-4' />
        <Skeleton className='h-3 w-4/5 sm:h-4' />

        <div className='flex items-center gap-2'>
          <Skeleton className='h-5 w-14 sm:h-6 sm:w-16' />
          <Skeleton className='h-3 w-10 sm:h-4 sm:w-12' />
          <Skeleton className='xs:block ml-auto hidden h-4 w-20 rounded-full sm:h-5 sm:w-24' />
        </div>

        <div className='flex gap-1.5 sm:gap-2'>
          <div className='flex w-full gap-1.5'>
            <Skeleton className='h-8 w-full rounded-md sm:h-9' />
            <Skeleton className='h-8 w-full rounded-md sm:h-9' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
