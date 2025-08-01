'use client';

import { easeOut, motion } from 'framer-motion';
import { Bell, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ShopType } from '@/lib/types';
import { getInitials } from '@/lib/utils';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, easeOut },
  },
};

export default function ShopHeader({ shop }: { shop: ShopType }) {
  return (
    <motion.div variants={itemVariants} initial='hidden' animate='visible'>
      <div className='relative -mt-24 flex flex-col sm:flex-row sm:items-end sm:space-x-5'>
        <div className='relative h-32 w-32 overflow-hidden rounded-xl border-4 border-white bg-white sm:h-40 sm:w-40'>
          {shop.logo?.url ? (
            <Image
              src={shop.logo.url || '/placeholder.svg'}
              alt={shop.logo.alt || shop.name}
              fill
              className='object-cover'
              priority
            />
          ) : (
            <div className='bg-muted text-muted-foreground flex h-full w-full items-center justify-center text-3xl font-bold'>
              {getInitials(shop.name)}
            </div>
          )}
        </div>
        <div className='mt-6 sm:mt-0 sm:flex-1'>
          <div className='flex items-center space-x-2'>
            <h1 className='text-primary text-2xl font-bold sm:text-3xl'>
              {shop.name}
            </h1>
            {shop.isVerified && (
              <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
                Verified
              </Badge>
            )}
            <Badge
              variant={shop.status === 'PENDING' ? 'secondary' : 'default'}
              className='rounded-full px-3 py-1 text-xs'
            >
              {shop.status === 'PENDING' ? 'Pending' : 'Active'}
            </Badge>
          </div>
          <div className='text-muted-foreground mt-1 flex items-center text-sm'>
            <MapPin className='mr-1 h-4 w-4' />
            {shop.address}
          </div>
        </div>
        <div className='mt-3 flex gap-4 md:mt-0 md:gap-10'>
          <Button variant='secondary' asChild>
            <Link href={`mailto:${shop.shopEmail}`}>
              <Mail className='mr-2 h-4 w-4' />
              Contact
            </Link>
          </Button>
          <Button variant='default'>
            <Bell className='mr-2 h-4 w-4' />
            Follow Shop
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
