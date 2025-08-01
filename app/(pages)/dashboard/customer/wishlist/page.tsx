'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';

import { ProductCard } from '@/app/(pages)/(public)/products/product-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProductCardType } from '@/lib/types';
import { useWishlist } from '@/services/customer/wishlist';

export default function WishList() {
  const { isPending, data, isError } = useWishlist();

  if (isPending) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <Skeleton className='mb-2 h-8 w-48' />
          <Skeleton className='h-4 w-64' />
        </div>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            //  biome-ignore lint: error
            <Card key={i} className='overflow-hidden'>
              <Skeleton className='h-64 w-full' />
              <CardContent className='p-4'>
                <Skeleton className='mb-2 h-4 w-full' />
                <Skeleton className='mb-4 h-4 w-3/4' />
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-4 w-16' />
                  <Skeleton className='h-4 w-12' />
                </div>
              </CardContent>
              <CardFooter className='gap-2 p-4 pt-0'>
                <Skeleton className='h-9 flex-1' />
                <Skeleton className='h-9 w-9' />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Alert variant='destructive'>
          <AlertDescription>
            Failed to load your wishlist. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const wishlistItems: ProductCardType[] = data || [];

  if (wishlistItems.length === 0) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='py-16 text-center'>
          <Heart className='text-muted-foreground mx-auto mb-4 h-16 w-16' />
          <h2 className='mb-2 text-2xl font-semibold'>
            Your wishlist is empty
          </h2>
          <p className='text-muted-foreground mb-6'>
            Start adding items you love to your wishlist
          </p>
          <Button>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4'>
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold'>My Wishlist</h1>
        <p className='text-muted-foreground'>
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}{' '}
          saved for later
        </p>
      </div>

      <div className='grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {wishlistItems.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>

      <div className='mt-12 text-center'>
        <Link href='/products'>
          <Button variant='outline' size='lg'>
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
