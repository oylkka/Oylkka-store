import { createFileRoute, redirect } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

import { BannerForm } from '@/components/forms/banner-form';
import { Skeleton } from '@/components/ui/skeleton';
import { useBanner } from '@/services/banner';

export const Route = createFileRoute('/dashboard/admin/banner/edit')({
  beforeLoad: ({ context }) => {
    if (!context.user.role || context.user.role !== 'ADMIN') {
      throw redirect({ to: '/dashboard' });
    }
    return { user: context.user };
  },
  validateSearch: (search: Record<string, string | undefined>) => ({
    bannerId: search.bannerId ?? '',
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { bannerId } = Route.useSearch();
  const { data: banner, isLoading, isError } = useBanner(bannerId);

  if (!bannerId) {
    return (
      <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
        <p className='text-sm text-muted-foreground'>No banner selected.</p>
      </div>
    );
  }

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
        <Skeleton className='h-40 rounded-2xl' />
        <Skeleton className='h-52 rounded-2xl' />
      </div>
    );
  }

  if (isError || !banner) {
    return (
      <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
        <div className='w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center'>
          <Loader2 className='w-6 h-6 text-destructive' />
        </div>
        <p className='text-sm font-semibold'>Banner not found</p>
        <p className='text-sm text-muted-foreground max-w-xs'>
          The banner you're looking for doesn't exist or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <BannerForm
      mode='edit'
      bannerId={bannerId}
      existingImageUrl={banner.imageUrl}
      defaultValues={{
        title: banner.title,
        subtitle: banner.subTitle ?? '',
        description: banner.description ?? '',
        bannerTag:
          (banner.bannerTag as 'PROMO' | 'INFO' | 'ANNOUNCEMENT') ?? undefined,
        alignment: banner.alignment as 'LEFT' | 'CENTER' | 'RIGHT',
        bannerPosition: banner.bannerPosition as
          | 'HOME_TOP'
          | 'HOME_BOTTOM'
          | 'SIDEBAR',
        primaryActionText: banner.primaryActionText ?? '',
        primaryActionLink: banner.primaryActionLink ?? '',
        secondaryActionText: banner.secondaryActionText ?? '',
        secondaryActionLink: banner.secondaryActionLink ?? '',
        startDate: banner.startDate ? new Date(banner.startDate) : undefined,
        endDate: banner.endDate ? new Date(banner.endDate) : undefined,
        image: undefined,
        hasExistingImage: true,
        keepExistingImage: true,
      }}
    />
  );
}
