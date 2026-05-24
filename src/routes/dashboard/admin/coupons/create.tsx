import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCouponMutation } from '@/services/admin-coupons';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE, delay },
  }),
};

export const Route = createFileRoute('/dashboard/admin/coupons/create')({
  beforeLoad: ({ context }) => {
    if (
      !context.user?.role ||
      (context.user.role !== 'ADMIN' && context.user.role !== 'MANAGER')
    ) {
      throw redirect({ to: '/dashboard' });
    }
    return { user: context.user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const createMutation = useCreateCouponMutation();

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('PERCENTAGE');
  const [value, setValue] = useState('');
  const [scope, setScope] = useState('ALL');
  const [scopeId, setScopeId] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [maxUsesPerUser, setMaxUsesPerUser] = useState('');
  const [firstOrderOnly, setFirstOrderOnly] = useState(false);
  const [autoApply, setAutoApply] = useState(false);
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !value) return;

    await createMutation.mutateAsync({
      code: code.trim(),
      description: description || undefined,
      type,
      value: Number(value),
      scope,
      scopeId: scopeId || undefined,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      maxUses: maxUses ? Number(maxUses) : 0,
      maxUsesPerUser: maxUsesPerUser ? Number(maxUsesPerUser) : 0,
      firstOrderOnly,
      autoApply,
      startsAt: startsAt || undefined,
      expiresAt: expiresAt || undefined,
      isActive,
    });

    navigate({ to: '/dashboard/admin/coupons' });
  };

  return (
    <motion.div
      className='space-y-6 max-w-2xl'
      initial='hidden'
      animate='show'
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      <motion.div variants={fadeUp} custom={0}>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Create Coupon</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Create a new promotional coupon for your store
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} custom={1}>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Coupon Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='code'>Coupon Code *</Label>
                  <Input
                    id='code'
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder='e.g. SUMMER20'
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='type'>Discount Type *</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='PERCENTAGE'>Percentage (%)</SelectItem>
                      <SelectItem value='FIXED'>Fixed Amount</SelectItem>
                      <SelectItem value='CASHBACK'>Cashback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='value'>
                    {type === 'PERCENTAGE' ? 'Discount % *' : 'Discount Amount *'}
                  </Label>
                  <Input
                    id='value'
                    type='number'
                    min='0'
                    step='0.01'
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 500'}
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='scope'>Scope *</Label>
                  <Select value={scope} onValueChange={setScope}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='ALL'>All Products</SelectItem>
                      <SelectItem value='CATEGORY'>Category</SelectItem>
                      <SelectItem value='PRODUCT'>Product</SelectItem>
                      <SelectItem value='SHOP'>Shop</SelectItem>
                      <SelectItem value='USER'>Specific User</SelectItem>
                      <SelectItem value='GLOBAL'>Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {scope !== 'ALL' && scope !== 'GLOBAL' && (
                <div className='space-y-2'>
                  <Label htmlFor='scopeId'>
                    {scope === 'CATEGORY'
                      ? 'Category ID'
                      : scope === 'PRODUCT'
                        ? 'Product ID'
                        : scope === 'SHOP'
                          ? 'Shop ID'
                          : 'User ID'}
                  </Label>
                  <Input
                    id='scopeId'
                    value={scopeId}
                    onChange={(e) => setScopeId(e.target.value)}
                    placeholder='Enter ID...'
                  />
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Optional description for internal use'
                  rows={2}
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='minOrderAmount'>Min. Order Amount</Label>
                  <Input
                    id='minOrderAmount'
                    type='number'
                    min='0'
                    step='0.01'
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder='0'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='maxDiscount'>Max Discount</Label>
                  <Input
                    id='maxDiscount'
                    type='number'
                    min='0'
                    step='0.01'
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder='Unlimited'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='maxUses'>Max Total Uses</Label>
                  <Input
                    id='maxUses'
                    type='number'
                    min='0'
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder='Unlimited'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='maxUsesPerUser'>Max Uses Per User</Label>
                  <Input
                    id='maxUsesPerUser'
                    type='number'
                    min='0'
                    value={maxUsesPerUser}
                    onChange={(e) => setMaxUsesPerUser(e.target.value)}
                    placeholder='Unlimited'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='autoApply'>Auto Apply</Label>
                  <div className='flex items-center h-10'>
                    <Switch
                      id='autoApply'
                      checked={autoApply}
                      onCheckedChange={setAutoApply}
                    />
                    <Label htmlFor='autoApply' className='ml-2 text-sm text-muted-foreground'>
                      Automatically apply to eligible carts
                    </Label>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='startsAt'>Start Date</Label>
                  <Input
                    id='startsAt'
                    type='datetime-local'
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='expiresAt'>Expiry Date</Label>
                  <Input
                    id='expiresAt'
                    type='datetime-local'
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>

              <div className='flex items-center gap-6 pt-2'>
                <div className='flex items-center gap-2'>
                  <Switch
                    id='firstOrderOnly'
                    checked={firstOrderOnly}
                    onCheckedChange={setFirstOrderOnly}
                  />
                  <Label htmlFor='firstOrderOnly'>First order only</Label>
                </div>
                <div className='flex items-center gap-2'>
                  <Switch
                    id='isActive'
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor='isActive'>Active</Label>
                </div>
              </div>

              <div className='flex items-center gap-3 pt-4'>
                <Button
                  type='submit'
                  disabled={createMutation.isPending || !code.trim() || !value}
                >
                  {createMutation.isPending && (
                    <span className='w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  )}
                  Create Coupon
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => navigate({ to: '/dashboard/admin/coupons' })}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
