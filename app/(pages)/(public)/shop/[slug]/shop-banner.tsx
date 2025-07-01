'use client';

import { easeOut, motion } from 'framer-motion';
import Image from 'next/image';

import type { Shop } from '@/lib/types';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, easeOut },
  },
};

export default function ShopBanner({ shop }: { shop: Shop }) {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="relative h-64 w-full sm:h-80 md:h-96"
    >
      {shop.bannerImage?.url ? (
        <Image
          src={shop.bannerImage.url || '/placeholder.svg'}
          alt={shop.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-300" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </motion.div>
  );
}
