import { Link } from '@tanstack/react-router';
import { Image } from '@unpic/react';
import { ArrowRight, MapPin, Star, Store } from 'lucide-react';
import { motion } from 'motion/react';
import type { PublicShopListShop } from '@/services/shop';

type ShopCardProps = {
  shop: PublicShopListShop;
};

export function ShopCard({ shop }: ShopCardProps) {
  return (
    <Link to='/shop/$slug' params={{ slug: shop.slug }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 16 },
          show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
          },
        }}
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className='group rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:bg-primary/[0.02] transition-colors duration-300 cursor-pointer'
      >
        <div className='flex items-center gap-4 mb-4'>
          <div className='relative w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0 ring-2 ring-border group-hover:ring-primary/30 transition-all duration-300'>
            {shop.logoUrl ? (
              <Image
                src={shop.logoUrl}
                width={80}
                height={80}
                alt={shop.name}
                layout='fixed'
                className='object-cover w-full h-full'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center bg-muted'>
                <Store className='w-6 h-6 text-muted-foreground/50' />
              </div>
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <h3 className='text-sm font-semibold truncate group-hover:text-primary transition-colors'>
              {shop.name}
            </h3>
            <div className='flex items-center gap-2 mt-1'>
              <Star className='w-3 h-3 text-amber-400 fill-amber-400' />
              <span className='text-xs text-muted-foreground font-medium'>
                {shop.rating.toFixed(1)}
              </span>
              <span className='text-xs text-muted-foreground'>
                ({shop.totalReviews.toLocaleString()})
              </span>
            </div>
          </div>
        </div>

        {shop.description && (
          <p className='text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3'>
            {shop.description}
          </p>
        )}

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3 text-xs text-muted-foreground'>
            {shop.city && (
              <span className='flex items-center gap-1'>
                <MapPin className='w-3 h-3' />
                {shop.city}
                {shop.country && `, ${shop.country}`}
              </span>
            )}
            <span>{shop._count.products.toLocaleString()} products</span>
          </div>
          <ArrowRight className='w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0' />
        </div>
      </motion.div>
    </Link>
  );
}

export function ShopCardSkeleton() {
  return (
    <div className='rounded-2xl border border-border bg-card p-5'>
      <div className='flex items-center gap-4 mb-4'>
        <div className='w-14 h-14 rounded-xl bg-muted animate-pulse shrink-0' />
        <div className='flex-1 space-y-2'>
          <div className='h-4 w-3/4 bg-muted animate-pulse rounded' />
          <div className='h-3 w-1/2 bg-muted animate-pulse rounded' />
        </div>
      </div>
      <div className='h-8 w-full bg-muted animate-pulse rounded mb-3' />
      <div className='h-3 w-2/3 bg-muted animate-pulse rounded' />
    </div>
  );
}
