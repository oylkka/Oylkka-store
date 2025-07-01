'use client';

import { easeOut, motion } from 'framer-motion';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ShopType } from '@/lib/types';

import { ProductCard } from '../../products/product-card';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, easeOut },
  },
};

export default function ShopProducts({ shop }: { shop: ShopType }) {
  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Products</CardTitle>
          <CardDescription>
            Browse through all the products offered by {shop.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shop.products && shop.products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {shop.products.slice(0, 8).map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">
                No products available yet.
              </p>
              <Button variant="outline" className="mt-4">
                Check Back Later
              </Button>
            </div>
          )}
        </CardContent>
        {shop.products && shop.products.length > 8 && (
          <div className="flex justify-center p-6 pt-0">
            <Link href={`/shops/${shop.slug}/products`}>
              <Button variant="outline">View All Products</Button>
            </Link>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
