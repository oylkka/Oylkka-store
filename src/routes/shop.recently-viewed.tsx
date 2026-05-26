import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Clock, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';

interface RecentProduct {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  viewedAt: number;
}

const STORAGE_KEY = 'oylkka_recently_viewed';
const MAX_ITEMS = 20;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE, delay },
  }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE } },
};

export const Route = createFileRoute('/shop/recently-viewed')({
  component: RouteComponent,
});

function getStored(): RecentProduct[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: this is fine
    console.error('Failed to parse stored recent products:', error);
    return [];
  }
}

export function trackProductView(product: Omit<RecentProduct, 'viewedAt'>) {
  try {
    const items = getStored().filter((p) => p.id !== product.id);
    items.unshift({ ...product, viewedAt: Date.now() });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items.slice(0, MAX_ITEMS)),
    );
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: this is fine
    console.error('Failed to track product view:', error);
  }
}

function RouteComponent() {
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    setItems(getStored());
  }, []);

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  };

  return (
    <div className='min-h-screen bg-background'>
      <Header />

      <div className='border-b border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24'>
          <motion.div
            initial='hidden'
            animate='show'
            variants={fadeUp}
            custom={0}
          >
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='mb-8 gap-2 text-primary'
            >
              <Link to='/products'>
                <ArrowLeft className='w-3.5 h-3.5' /> Back to Products
              </Link>
            </Button>
          </motion.div>
          <motion.div
            initial='hidden'
            animate='show'
            variants={fadeUp}
            custom={0.08}
          >
            <div className='flex items-center gap-3 mb-4'>
              <div className='h-px w-8 bg-primary' />
              <span className='text-xs font-semibold tracking-[0.18em] uppercase text-primary'>
                Recently Viewed
              </span>
            </div>
            <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight'>
              Your{' '}
              <span className='italic font-bold text-primary'>Recently</span>{' '}
              Viewed
              <span className='text-primary'>.</span>
            </h1>
            <p className='text-sm text-muted-foreground mt-3 max-w-2xl'>
              Products you've browsed, ready to pick up right where you left
              off.
            </p>
          </motion.div>
        </div>
      </div>

      <div className='border-b border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24'>
          {items.length > 0 && (
            <motion.div
              initial='hidden'
              animate='show'
              variants={fadeUp}
              custom={0.12}
              className='flex justify-end mb-8'
            >
              <Button variant='outline' size='sm' onClick={clear}>
                Clear History
              </Button>
            </motion.div>
          )}

          {items.length === 0 ? (
            <motion.div
              initial='hidden'
              animate='show'
              variants={fadeUp}
              custom={0.14}
              className='flex flex-col items-center justify-center py-20 gap-4 text-center'
            >
              <div className='w-16 h-16 rounded-2xl bg-muted flex items-center justify-center'>
                <Clock className='w-7 h-7 text-muted-foreground' />
              </div>
              <div>
                <p className='text-sm font-semibold'>
                  No recently viewed items
                </p>
                <p className='text-sm text-muted-foreground mt-1 max-w-xs'>
                  Products you view will appear here.
                </p>
              </div>
              <Button size='sm' asChild className='mt-2'>
                <Link to='/products'>Browse Products</Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial='hidden'
              animate='show'
              variants={stagger}
              className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'
            >
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                >
                  <Link
                    to='/product/$slug'
                    params={{ slug: item.slug }}
                    className='group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 transition-shadow duration-300'
                  >
                    <div className='relative overflow-hidden aspect-square bg-muted'>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
                          <ShoppingBag className='w-6 h-6' />
                        </div>
                      )}
                    </div>
                    <div className='p-4'>
                      <h3 className='text-sm font-semibold leading-snug line-clamp-2'>
                        {item.name}
                      </h3>
                      <p className='text-lg font-bold tabular-nums mt-2'>
                        BDT {item.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
