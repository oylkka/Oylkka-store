import { Link } from '@tanstack/react-router';
import { Heart, Package, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'motion/react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAddToCartMutation } from '@/services/cart';
import type { CategoryProduct } from '@/services/product';

type ProductCardProps = {
  product: CategoryProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useAddToCartMutation();

  const discountPct = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      )
    : null;

  const isNew =
    Date.now() - new Date(product.createdAt).getTime() <
    7 * 24 * 60 * 60 * 1000;

  const thumbnail = product.images?.[0]?.imageUrl || null;

  return (
    <Link to='/product/$slug' params={{ slug: product.slug }}>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className='group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 transition-shadow duration-300 cursor-pointer'
      >
        <div className='relative overflow-hidden aspect-square bg-muted'>
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={product.productName}
              className='object-cover w-full h-full group-hover:scale-105 transition-transform duration-500'
            />
          ) : (
            <div className='flex items-center justify-center w-full h-full'>
              <Package className='w-8 h-8 text-muted-foreground' />
            </div>
          )}

          <div className='absolute top-2 left-2 flex flex-col gap-1'>
            {discountPct && (
              <span className='text-[10px] font-semibold tracking-wide bg-destructive/90 text-destructive-foreground px-2 py-0.5 rounded-md'>
                -{discountPct}%
              </span>
            )}
            {isNew && (
              <span className='text-[10px] font-semibold tracking-wide bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-md'>
                New
              </span>
            )}
          </div>

          <button
            type='button'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className='absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background'
          >
            <Heart className='w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors' />
          </button>
        </div>

        <div className='p-4 flex flex-col gap-2'>
          {product.shop && (
            <div className='flex items-center gap-1.5'>
              <span className='w-1.5 h-1.5 rounded-full bg-primary' />
              <span className='text-xs font-medium text-primary truncate'>
                {product.shop.name}
              </span>
            </div>
          )}

          <h3 className='text-sm font-semibold leading-snug line-clamp-2'>
            {product.productName}
          </h3>

          <div className='flex items-center gap-1.5'>
            <div className='flex items-center gap-0.5'>
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: star
                <Star key={i} className='w-3 h-3 text-muted-foreground' />
              ))}
            </div>
            <span className='text-xs text-muted-foreground'>
              ({product._count.reviews})
            </span>
          </div>

          <div className='flex items-baseline gap-2'>
            <span className='text-base font-bold tabular-nums'>
              ৳{(product.discountPrice ?? product.price).toLocaleString()}
            </span>
            {product.discountPrice && (
              <span className='text-sm text-muted-foreground line-through tabular-nums'>
                ৳{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {product.stock <= 5 && product.stock > 0 && (
            <p className='text-[11px] font-medium text-amber-600 dark:text-amber-400'>
              Only {product.stock} left
            </p>
          )}
          {product.stock === 0 && (
            <p className='text-[11px] font-medium text-muted-foreground'>
              Out of stock
            </p>
          )}

          <Button
            size='sm'
            className='w-full mt-1 gap-1.5 h-8 text-xs'
            disabled={product.stock <= 0}
            onClick={(e) => {
              if (product.hasVariants) return;
              e.preventDefault();
              e.stopPropagation();
              addToCart.mutate({
                productId: product.id,
                quantity: 1,
              });
            }}
          >
            <ShoppingCart className='w-3.5 h-3.5' />
            {product.hasVariants ? 'Select Options' : 'Add to Cart'}
          </Button>
        </div>
      </motion.div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className='rounded-2xl border border-border overflow-hidden'>
      <Skeleton className='aspect-square w-full' />
      <div className='p-4 space-y-2'>
        <Skeleton className='h-3 w-20' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-4 w-16' />
        <Skeleton className='h-8 w-full mt-2' />
      </div>
    </div>
  );
}
