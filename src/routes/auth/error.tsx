import { createFileRoute, Link } from '@tanstack/react-router';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'motion/react';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE, delay },
  }),
};

export const Route = createFileRoute('/auth/error')({
  validateSearch: (
    search: Record<string, string | undefined>,
  ): { error?: string; message?: string } => ({
    error: search.error,
    message: search.message,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { error, message } = Route.useSearch();

  const title = error
    ? {
        unauthorized: 'Access Denied',
        expired: 'Session Expired',
        cancelled: 'Sign-in Cancelled',
      }[error] || 'Authentication Error'
    : 'Authentication Error';

  const description =
    message ||
    (error === 'unauthorized'
      ? 'You do not have permission to access this resource.'
      : error === 'expired'
        ? 'Your session has expired. Please sign in again.'
        : error === 'cancelled'
          ? 'The sign-in process was cancelled.'
          : 'Something went wrong during authentication. Please try again.');

  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <div className='container flex min-h-[calc(100vh-var(--header-height)-var(--footer-height))] items-center justify-center py-12'>
        <motion.div
          initial='hidden'
          animate='show'
          variants={fadeUp}
          custom={0}
          className='w-full max-w-md'
        >
          <Card className='rounded-2xl border-border shadow-none'>
            <CardContent className='flex flex-col items-center gap-4 p-8 text-center'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20'>
                <AlertTriangle className='h-8 w-8 text-amber-600 dark:text-amber-400' />
              </div>
              <h1 className='text-2xl font-bold'>{title}</h1>
              <p className='text-muted-foreground text-balance text-sm'>
                {description}
              </p>
              <div className='flex flex-col gap-2 mt-2 w-full'>
                <Button size='lg' asChild>
                  <Link to='/auth/signin'>
                    <ArrowLeft className='h-4 w-4' />
                    Sign In Again
                  </Link>
                </Button>
                <Button variant='outline' size='lg' asChild>
                  <Link to='/'>
                    <Home className='h-4 w-4' />
                    Go Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
