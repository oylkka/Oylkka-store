import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { ShopForm } from '@/components/forms/shop-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyShop } from '@/services/shop';

export const Route = createFileRoute('/dashboard/become-vendor/apply')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: shop, isLoading } = useMyShop();

  if (isLoading) {
    return (
      <div className='max-w-4xl mx-auto container space-y-6'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-10 w-64' />
          <Skeleton className='h-4 w-96' />
        </div>
        <div className='grid gap-6 md:grid-cols-2'>
          <Skeleton className='h-80 rounded-2xl' />
          <Skeleton className='h-80 rounded-2xl' />
        </div>
        <Skeleton className='h-52 rounded-2xl' />
      </div>
    );
  }

  if (shop?.status === 'PENDING') {
    navigate({ to: '/dashboard/become-vendor/pending' });
    return null;
  }

  if (shop?.status === 'ACTIVE') {
    navigate({ to: '/dashboard' });
    return null;
  }

  return <ShopForm mode='create' />;
}
