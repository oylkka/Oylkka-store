import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { CheckCircle2 } from 'lucide-react';
import Footer from '#/components/layout/footer';
import Header from '#/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const Route = createFileRoute('/checkout/confirmation')({
  validateSearch: (
    search: Record<string, string | undefined>,
  ): { orderId?: string; error?: string } => ({
    orderId: search.orderId,
    error: search.error,
  }),
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/auth/signin' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId, error } = Route.useSearch();

  if (error) {
    const isCancelled = error === 'payment-cancelled';
    return (
      <>
        <Header />
        <div className='container flex min-h-[calc(100vh-var(--header-height)-var(--footer-height))] items-center justify-center py-12'>
          <Card className='w-full max-w-md'>
            <CardContent className='flex flex-col items-center gap-4 p-8 text-center'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20'>
                <CheckCircle2 className='h-8 w-8 text-amber-600 dark:text-amber-400' />
              </div>
              <h1 className='text-2xl font-bold'>
                {isCancelled ? 'Payment Cancelled' : 'Payment Failed'}
              </h1>
              <p className='text-muted-foreground text-balance text-sm'>
                {isCancelled
                  ? 'You cancelled the payment. Your order has been saved but not confirmed yet.'
                  : 'Your payment could not be completed. Your order has been saved but not confirmed yet.'}
              </p>
              {orderId && (
                <Button asChild className='mt-2'>
                  <Link to='/dashboard/orders/$orderId' params={{ orderId }}>
                    View Order
                  </Link>
                </Button>
              )}
              <Button variant='outline' asChild>
                <Link to='/checkout'>Try Again</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (!orderId) {
    return (
      <>
        <Header />
        <div className='container flex min-h-[calc(100vh-var(--header-height)-var(--footer-height))] items-center justify-center py-12'>
          <Card className='w-full max-w-md'>
            <CardContent className='flex flex-col items-center gap-4 p-8 text-center'>
              <h1 className='text-2xl font-bold'>Order not found</h1>
              <p className='text-muted-foreground text-balance text-sm'>
                No order reference was provided.
              </p>
              <Button asChild className='mt-2'>
                <Link to='/products'>Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className='container flex min-h-[calc(100vh-var(--header-height)-var(--footer-height))] items-center justify-center py-12'>
        <Card className='w-full max-w-md'>
          <CardContent className='flex flex-col items-center gap-4 p-8 text-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
              <CheckCircle2 className='h-8 w-8 text-green-600 dark:text-green-400' />
            </div>
            <h1 className='text-2xl font-bold'>Order Placed!</h1>
            <p className='text-muted-foreground text-balance text-sm'>
              Thank you for your order. We'll send you a confirmation once it's
              processed.
            </p>
            <div className='flex flex-col gap-2 mt-2 w-full'>
              <Button asChild>
                <Link to='/dashboard/orders/$orderId' params={{ orderId }}>
                  View Order
                </Link>
              </Button>
              <Button variant='outline' asChild>
                <Link to='/dashboard/orders/$orderId' params={{ orderId }}>
                  Download Invoice
                </Link>
              </Button>
              <Button variant='ghost' asChild>
                <Link to='/products'>Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
