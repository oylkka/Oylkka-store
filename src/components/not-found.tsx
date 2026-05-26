import { Link } from '@tanstack/react-router';
import { ArrowLeft, Frown } from 'lucide-react';
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

export function NotFound() {
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
            <div className='flex items-center gap-3 mb-4'>
              <div className='h-px w-8 bg-primary' />
              <span className='text-xs font-semibold tracking-[0.18em] uppercase text-primary'>
                404 Error
              </span>
            </div>
            <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight'>
              404 — <span className='italic font-bold text-primary'>Page</span>{' '}
              not found
              <span className='text-primary'>.</span>
            </h1>
            <p className='text-sm text-muted-foreground mt-3 max-w-2xl'>
              The page you are looking for doesn't exist or has been moved.
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
            className='flex flex-col items-center text-center'
          >
            <div className='w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6'>
              <Frown className='w-7 h-7 text-muted-foreground' />
            </div>
            <h2 className='text-2xl md:text-3xl font-bold leading-tight tracking-tight mb-4'>
              Lost your{' '}
              <span className='italic font-bold text-primary'>way</span>
              <span className='text-primary'>?</span>
            </h2>
            <p className='text-sm text-muted-foreground mb-6 max-w-md'>
              Let's get you back on track. Head to the homepage or browse our
              products.
            </p>
            <div className='flex gap-3'>
              <Button size='lg' asChild>
                <Link to='/'>Go Home</Link>
              </Button>
              <Button variant='outline' size='lg' asChild>
                <Link to='/products'>Browse Products</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
