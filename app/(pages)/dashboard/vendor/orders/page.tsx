import { Suspense } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { OrdersContent } from './order-content';

export default function VendorOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className='container mx-auto px-4 py-6'>
          <Card className='shadow-lg'>
            <CardHeader>
              <Skeleton className='h-8 w-48' />
              <Skeleton className='mt-2 h-4 w-64' />
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <Skeleton className='h-10 w-full max-w-md' />
                <Skeleton className='h-[300px] w-full' />
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
