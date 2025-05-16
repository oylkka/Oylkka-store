'use client';

import { motion } from 'framer-motion';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ShopType } from '@/lib/types';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export default function ShopPolicies({ shop }: { shop: ShopType }) {
  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Shop Policies</CardTitle>
          <CardDescription>
            Learn about {shop.name}&apos;s shipping, returns, and other
            policies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {shop.policies ? (
              <>
                <div>
                  <h3 className="text-lg font-medium">Shipping Policy</h3>
                  <p className="mt-2 text-gray-600">
                    {shop.policies.shipping || 'No shipping policy available.'}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium">Return Policy</h3>
                  <p className="mt-2 text-gray-600">
                    {shop.policies.returns || 'No return policy available.'}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium">Privacy Policy</h3>
                  <p className="mt-2 text-gray-600">
                    {shop.policies.privacy || 'No privacy policy available.'}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-600">
                No policies have been specified for this shop.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
