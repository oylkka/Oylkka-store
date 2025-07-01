'use client';

import { easeOut, motion } from 'framer-motion';
import { Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ShopType } from '@/lib/types';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, easeOut },
  },
};

export default function ShopReviews({ shop }: { shop: ShopType }) {
  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Customer Reviews</CardTitle>
          <CardDescription>
            See what customers are saying about {shop.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <div className="flex justify-center">
                <Star className="h-12 w-12 text-yellow-500" />
              </div>
              <h3 className="mt-2 text-2xl font-bold">
                {shop.rating.toFixed(1)}
              </h3>
              <p className="text-sm text-gray-500">Based on customer reviews</p>
              <Button variant="outline" className="mt-4">
                Write a Review
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
