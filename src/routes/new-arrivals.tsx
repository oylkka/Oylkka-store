import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE, delay },
  }),
};

export const Route = createFileRoute('/new-arrivals')({
  component: NewArrivalsPage,
});

function NewArrivalsPage() {
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
              <Link to='/'>
                <ArrowLeft className='w-3.5 h-3.5' /> Back to Home
              </Link>
            </Button>
          </motion.div>
          <motion.div
            initial='hidden'
            animate='show'
            variants={fadeUp}
            custom={0.08}
          >
            <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight'>
              New{' '}
              <span className='italic font-bold text-primary'>Arrivals</span>
              <span className='text-primary'>.</span>
            </h1>
            <p className='text-sm text-muted-foreground mt-3 max-w-2xl'>
              Discover the latest products from our verified vendors. From
              trending fashion to cutting-edge electronics, be the first to own
              the newest items.
            </p>
          </motion.div>
        </div>
      </div>

      <div className='border-b border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24'>
          <motion.div
            initial='hidden'
            whileInView='show'
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0}
          >
            <div className='flex items-center gap-3 mb-4'>
              <div className='h-px w-8 bg-primary' />
              <span className='text-xs font-semibold tracking-[0.18em] uppercase text-primary'>
                Just In
              </span>
              <span className='text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full animate-pulse'>
                NEW
              </span>
            </div>

            {/* Empty State Pattern from §16 of DESIGN.md */}
            <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
              <div className='w-16 h-16 rounded-2xl bg-muted flex items-center justify-center'>
                <Sparkles className='w-7 h-7 text-muted-foreground' />
              </div>
              <div>
                <p className='text-sm font-semibold'>Refreshing our stock</p>
                <p className='text-sm text-muted-foreground mt-1 max-w-xs'>
                  We're currently updating our catalog with fresh new arrivals.
                  Check back in a few moments to see what's new!
                </p>
              </div>
              <Button size='sm' asChild className='mt-2'>
                <Link href='/products'>Browse All Products</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
