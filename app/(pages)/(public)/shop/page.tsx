'use client';

import { AnimatePresence, easeOut, motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useShopList } from '@/services/vendor';

// Define Shop interface for TypeScript
interface ImageAsset {
  url: string;
  publicId: string;
  alt?: string | null;
}

interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address: string;
  shopEmail: string;
  shopPhone: string;
  status: 'PENDING' | 'ACTIVE';
  rating: number;
  totalSales: number;
  logo?: ImageAsset | null;
  bannerImage?: ImageAsset | null;
  createdAt: string;
  views: number;
}

// Animation variants for cards
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, easeOut },
  },
};

export default function ShopListPage() {
  const { isPending, data, isError } = useShopList();

  if (isPending) {
    return (
      <div className='container mx-auto grid grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 9 }).map((_, i) => (
          // biome-ignore lint: error
          <Skeleton key={i} className='h-[450px] w-full rounded-3xl' />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className='mt-24 text-center'>
        <h2 className='text-destructive text-3xl font-bold'>
          Something Went Wrong
        </h2>
        <p className='text-muted-foreground mt-3 text-lg'>
          Unable to load shops. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6'>
      {/* Header Section */}
      <div className='mb-12 text-center'>
        <h1 className='text-primary text-4xl font-extrabold tracking-tight'>
          Explore Our Shops
        </h1>
        <p className='text-muted-foreground mx-auto mt-4 max-w-2xl'>
          Discover a curated selection of unique stores offering the best
          products and experiences.
        </p>
      </div>

      {/* Shop Grid */}
      <AnimatePresence>
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {data.data.map((shop: Shop) => (
            <motion.div
              key={shop.id}
              variants={cardVariants}
              initial='hidden'
              animate='visible'
              exit='hidden'
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className='group'
            >
              <Card className='bg-card relative flex h-full flex-col overflow-hidden rounded-3xl border-none p-0 shadow-xl transition-all hover:shadow-2xl'>
                {/* Banner Image */}
                <div className='relative h-56 w-full'>
                  {shop.bannerImage?.url ? (
                    <Image
                      src={shop.bannerImage.url}
                      alt={shop.bannerImage.alt ?? shop.name}
                      fill
                      className='object-cover transition-transform duration-300 group-hover:scale-105'
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                      priority={false}
                    />
                  ) : (
                    <div className='h-full w-full bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-orange-900 dark:to-purple-900' />
                  )}
                  {/* Status Badge */}
                  <Badge
                    className='absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-medium'
                    variant={
                      shop.status === 'PENDING' ? 'secondary' : 'default'
                    }
                  >
                    {shop.status === 'PENDING' ? 'Pending' : 'Active'}
                  </Badge>
                </div>

                {/* Shop Logo */}
                <div className='absolute top-48 left-6 z-10'>
                  {shop.logo?.url ? (
                    <Image
                      src={shop.logo.url}
                      alt={shop.logo.alt ?? shop.name}
                      width={90}
                      height={90}
                      className='h-[90px] w-[90px] rounded-full border-4 object-cover shadow-lg'
                    />
                  ) : (
                    <div className='bg-muted text-muted-foreground flex h-[90px] w-[90px] items-center justify-center rounded-full border-4 text-2xl font-bold shadow-lg'>
                      {shop.name.charAt(0)}
                    </div>
                  )}
                </div>

                <CardHeader className='mt-12 flex-1'>
                  <CardTitle className='truncate text-2xl font-bold'>
                    {shop.name}
                  </CardTitle>
                  <div className='mt-2 flex items-center gap-1'>
                    <Star className='h-5 w-5 fill-yellow-500 text-yellow-500' />
                    <span className='text-muted-foreground text-sm'>
                      {shop.rating.toFixed(1)} ({shop.totalSales} sales)
                    </span>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <p className='text-base font-medium'>{shop.address}</p>
                  {shop.description ? (
                    <p className='text-muted-foreground line-clamp-3 text-sm'>
                      {shop.description}
                    </p>
                  ) : (
                    <p className='text-muted-foreground text-sm italic'>
                      No description available
                    </p>
                  )}
                </CardContent>

                <div className='mt-auto p-6 pt-0'>
                  <Link href={`/shop/${shop.slug}`}>
                    <Button className='w-full rounded-full text-base font-semibold'>
                      Visit Shop
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
