'use client';

import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import type { ShopType } from '@/lib/types';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export default function ShopStats({ shop }: { shop: ShopType }) {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 md:mt-12"
    >
      <Card>
        <CardContent className="flex flex-col items-center p-6">
          <Star className="h-8 w-8 text-yellow-500" />
          <h3 className="mt-2 text-2xl font-bold">{shop.rating.toFixed(1)}</h3>
          <p className="text-sm text-gray-500">Shop Rating</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center p-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
            <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
          </svg>
          <h3 className="mt-2 text-2xl font-bold">{shop.totalSales}</h3>
          <p className="text-muted-foreground text-sm">Products Sold</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center p-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-green-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <h3 className="mt-2 text-2xl font-bold">{shop.views}</h3>
          <p className="text-muted-foreground text-sm">Shop Views</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center p-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-purple-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6l9 6l9 -6" />
            <path d="M21 6v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-12" />
            <path d="M3 10l9 6l9 -6" />
          </svg>
          <h3 className="mt-2 text-center text-2xl font-bold">
            {format(new Date(shop.createdAt), 'MMMM d, yyyy')}
          </h3>
          <p className="text-muted-foreground text-sm">Member Since</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
