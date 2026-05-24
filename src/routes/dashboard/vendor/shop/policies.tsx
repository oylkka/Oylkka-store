import { createFileRoute, redirect } from '@tanstack/react-router';
import { FileText, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  useShopPolicies,
  useUpdatePoliciesMutation,
} from '@/services/vendor-policies';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE, delay },
  }),
};

export const Route = createFileRoute('/dashboard/vendor/shop/policies')({
  beforeLoad: ({ context }) => {
    if (!context.user?.role || context.user.role !== 'VENDOR') {
      throw redirect({ to: '/dashboard' });
    }
    return { user: context.user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = useShopPolicies();
  const updateMutation = useUpdatePoliciesMutation();

  const [shippingPolicy, setShippingPolicy] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');

  useEffect(() => {
    if (data?.policies) {
      setShippingPolicy(data.policies.shippingPolicy || '');
      setReturnPolicy(data.policies.returnPolicy || '');
      setTermsAndConditions(data.policies.termsAndConditions || '');
    }
  }, [data]);

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      shippingPolicy,
      returnPolicy,
      termsAndConditions,
    });
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-8 w-48' />
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className='h-5 w-32' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-32 w-full' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className='space-y-6'
      initial='hidden'
      animate='show'
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      <motion.div variants={fadeUp} custom={0}>
        <div className='flex items-center gap-2'>
          <FileText className='w-6 h-6' />
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Policies</h1>
            <p className='text-sm text-muted-foreground mt-1'>
              Manage your shop policies (shipping, returns, etc.)
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} custom={1}>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Shipping Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={shippingPolicy}
              onChange={(e) => setShippingPolicy(e.target.value)}
              placeholder='Describe your shipping policy — processing times, carriers, shipping costs, delivery estimates, etc.'
              rows={6}
              className='resize-y'
            />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} custom={2}>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Return & Refund Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={returnPolicy}
              onChange={(e) => setReturnPolicy(e.target.value)}
              placeholder='Describe your return policy — return window, condition requirements, who pays return shipping, refund processing time, etc.'
              rows={6}
              className='resize-y'
            />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} custom={3}>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              placeholder='Outline your terms and conditions — warranty info, liability disclaimers, governing law, etc.'
              rows={6}
              className='resize-y'
            />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} custom={4}>
        <div className='flex items-center gap-3'>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            )}
            Save Policies
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
