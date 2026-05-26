import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useRemoveFromWishlistMutation,
  useWishlist,
} from '@/services/wishlist';

export const Route = createFileRoute('/dashboard/wishlist')({
  component: WishlistPage,
});

function WishlistPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useWishlist();
  const removeMutation = useRemoveFromWishlistMutation();

  const items = data?.items ?? [];

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>My Wishlist</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Products you've saved for later
        </p>
      </div>

      {isLoading && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton
            <Skeleton key={i} className='h-64 rounded-2xl' />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
          <div className='w-16 h-16 rounded-2xl bg-muted flex items-center justify-center'>
            <Heart className='w-7 h-7 text-muted-foreground' />
          </div>
          <div>
            <p className='text-sm font-semibold'>Your wishlist is empty</p>
            <p className='text-sm text-muted-foreground mt-1 max-w-xs'>
              Save your favorite products here to buy them later
            </p>
          </div>
          <Button size='sm' asChild className='mt-2'>
            <Link to='/products'>Browse Products</Link>
          </Button>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {items.map((item) => (
            <Card
              key={item.id}
              className='rounded-2xl border-border shadow-none overflow-hidden group cursor-pointer'
              onClick={() =>
                navigate({ to: `/product/${item.product.slug}` } as never)
              }
            >
              <div className='aspect-square bg-muted relative overflow-hidden'>
                {item.product.images[0]?.imageUrl ? (
                  <img
                    src={item.product.images[0].imageUrl}
                    alt={item.product.productName}
                    className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                ) : (
                  <div className='h-full w-full flex items-center justify-center'>
                    <ShoppingBag className='h-10 w-10 text-muted-foreground/40' />
                  </div>
                )}
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMutation.mutate({
                      productId: item.productId,
                      variantId: item.variantId ?? undefined,
                    });
                  }}
                  className='absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
              <CardContent className='p-4 space-y-2'>
                <p className='text-sm font-semibold truncate'>
                  {item.product.productName}
                </p>
                {item.variant && (
                  <p className='text-xs text-muted-foreground'>
                    {item.variant.name}
                  </p>
                )}
                <div className='flex items-center gap-2'>
                  <span className='text-base font-bold'>
                    ৳
                    {(
                      item.variant?.discountPrice ??
                      item.product.discountPrice ??
                      item.variant?.price ??
                      item.product.price
                    ).toLocaleString('en-BD')}
                  </span>
                  {(item.variant?.discountPrice ??
                    item.product.discountPrice) != null && (
                    <span className='text-xs text-muted-foreground line-through'>
                      ৳
                      {(
                        item.variant?.price ?? item.product.price
                      ).toLocaleString('en-BD')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
