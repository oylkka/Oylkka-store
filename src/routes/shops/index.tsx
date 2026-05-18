import { createFileRoute, Link } from '@tanstack/react-router';
import { Search, Store, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { ShopCard, ShopCardSkeleton } from '@/components/pages/shop/shop-card';
import { Button } from '@/components/ui/button';
import { usePublicShops } from '@/services/shop';

export const Route = createFileRoute('/shops/')({
  component: RouteComponent,
});

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE, delay },
  }),
};

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

function RouteComponent() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePublicShops({
    page,
    search: search || undefined,
  });

  const shops = data?.shops ?? [];
  const totalPages = data?.totalPages ?? 0;
  const hasMore = page < totalPages;

  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24'>
        <motion.div
          initial='hidden'
          animate='show'
          variants={fadeUp}
          custom={0}
          className='flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10'
        >
          <div>
            <div className='flex items-center gap-3 mb-3'>
              <div className='h-px w-8 bg-primary' />
              <span className='text-xs font-semibold tracking-[0.18em] uppercase text-primary'>
                Marketplace
              </span>
            </div>
            <h2 className='text-2xl md:text-3xl font-bold tracking-tight leading-tight'>
              Explore{' '}
              <span className='italic font-bold text-primary'>Shops</span>
              <span className='text-primary'>.</span>
            </h2>
          </div>
        </motion.div>

        <motion.div
          initial='hidden'
          animate='show'
          variants={fadeUp}
          custom={0.08}
          className='mb-10'
        >
          <div className='flex items-center gap-0 rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all duration-200 overflow-hidden max-w-md'>
            <div className='flex items-center gap-2 px-3 flex-1'>
              <Search className='w-4 h-4 text-muted-foreground shrink-0' />
              <input
                type='search'
                placeholder='Search shops…'
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className='flex-1 h-11 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
              />
            </div>
            {search && (
              <button
                type='button'
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className='pr-3 text-muted-foreground hover:text-foreground transition-colors'
              >
                <X className='w-4 h-4' />
              </button>
            )}
          </div>
        </motion.div>

        {isLoading ? (
          <motion.div
            initial='hidden'
            animate='show'
            variants={gridVariants}
            className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
          >
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              <ShopCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : shops.length > 0 ? (
          <motion.div
            initial='hidden'
            animate='show'
            variants={gridVariants}
            className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
          >
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </motion.div>
        ) : (
          <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
            <div className='w-16 h-16 rounded-2xl bg-muted flex items-center justify-center'>
              <Store className='w-7 h-7 text-muted-foreground' />
            </div>
            <div>
              <p className='text-sm font-semibold'>
                {search ? 'No shops found' : 'No shops yet'}
              </p>
              <p className='text-sm text-muted-foreground mt-1 max-w-xs'>
                {search
                  ? `No shops matching "${search}"`
                  : 'Shops will appear here once vendors join.'}
              </p>
            </div>
            {search && (
              <Button
                size='sm'
                variant='outline'
                className='mt-2'
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
              >
                Clear Search
              </Button>
            )}
            {!search && (
              <Button size='sm' asChild className='mt-2'>
                <Link to='/'>Browse Home</Link>
              </Button>
            )}
          </div>
        )}

        {hasMore && (
          <motion.div
            initial='hidden'
            animate='show'
            variants={fadeUp}
            custom={0.2}
            className='flex justify-center mt-12'
          >
            <Button
              variant='outline'
              size='sm'
              className='gap-2'
              onClick={() => setPage((p) => p + 1)}
              disabled={isLoading}
            >
              Load More Shops
            </Button>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
