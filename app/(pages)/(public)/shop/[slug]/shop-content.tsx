'use client';

import { Button } from '@/components/ui/button';
import { useShopDetails } from '@/services/vendor';

import ShopAbout from './shop-about';
import ShopBanner from './shop-banner';
import ShopHeader from './shop-header';
import ShopPolicies from './shop-policies';
import ShopProducts from './shop-products';
import ShopReviews from './shop-reviews';
import ShopSkeleton from './shop-skeleton';
import ShopStats from './shop-stats';

export default function ShopContent({ slug }: { slug: string }) {
  const { isPending, data, isError } = useShopDetails({ slug });

  if (isPending) {
    return <ShopSkeleton />;
  }

  if (isError || !data?.shop) {
    return (
      <div className='flex h-96 w-full items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold'>Shop Not Found</h2>
          <p className='text-muted-foreground mt-2'>
            We couldn&apos;t load the shop information.
          </p>
          <Button className='mt-4' variant='outline'>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const shop = data.shop;

  return (
    <div className='min-h-screen pb-12'>
      <ShopBanner shop={shop} />
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <ShopHeader shop={shop} />
        <ShopStats shop={shop} />

        <div className='columns-1 gap-10 space-y-8 py-8 sm:columns-2'>
          <section id='about'>
            <ShopAbout shop={shop} />
          </section>

          <section id='reviews'>
            <ShopReviews shop={shop} />
          </section>

          <section id='policies'>
            <ShopPolicies shop={shop} />
          </section>
        </div>
        <section id='products'>
          <ShopProducts shop={shop} />
        </section>
      </div>
    </div>
  );
}
