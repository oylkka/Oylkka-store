import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Loader2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  useAdminCoupon,
  useDeleteCouponMutation,
  useUpdateCouponMutation,
} from '@/services/admin-coupons';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE, delay },
  }),
};

export const Route = createFileRoute('/dashboard/admin/coupons/$id')({
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
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useAdminCoupon(id);
  const updateMutation = useUpdateCouponMutation();
  const deleteMutation = useDeleteCouponMutation();

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

  useEffect(() => {
    if (data?.coupon) {
      const c = data.coupon;
      setCode(c.code);
      setDescription(c.description || '');
      setType(c.type);
      setValue(String(c.value));
      setScope(c.scope);
      setScopeId(c.scopeId || '');
      setMinOrderAmount(c.minOrderAmount ? String(c.minOrderAmount) : '');
      setMaxDiscount(c.maxDiscount ? String(c.maxDiscount) : '');
      setMaxUses(String(c.maxUses));
      setMaxUsesPerUser(String(c.maxUsesPerUser));
      setFirstOrderOnly(c.firstOrderOnly);
      setAutoApply(c.autoApply);
      setStartsAt(c.startsAt ? c.startsAt.slice(0, 16) : '');
      setExpiresAt(c.expiresAt ? c.expiresAt.slice(0, 16) : '');
      setIsActive(c.isActive);
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !value) return;

    await updateMutation.mutateAsync({
      id,
      code: code.trim(),
      description: description || null,
      type,
      value: Number(value),
      scope,
      scopeId: scopeId || null,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      maxUses: Number(maxUses) || 0,
      maxUsesPerUser: Number(maxUsesPerUser) || 0,
      firstOrderOnly,
      autoApply,
      startsAt: startsAt || null,
      expiresAt: expiresAt || null,
      isActive,
    });

    navigate({ to: '/dashboard/admin/coupons' });
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      navigate({ to: '/dashboard/admin/coupons' });
    } catch {
      // error handled in service
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-6 max-w-2xl'>
        <Skeleton className='h-8 w-48' />
        <Card>
          <CardContent className='py-8'>
            <div className='space-y-4'>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className='h-10 w-full' />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data?.coupon) {
    return (
      <div className='flex items-center justify-center py-20'>
        <p className='text-muted-foreground'>Coupon not found</p>
      </div>
    );
  }

  return (
    <motion.div
      className='space-y-6 max-w-2xl'
      initial='hidden'
      animate='show'
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      <motion.div variants={fadeUp} custom={0}>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Edit Coupon</h1>
            <p className='text-sm text-muted-foreground mt-1'>
              Update coupon details for {data.coupon.code}
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive' size='sm'>
                <Trash2 className='w-4 h-4 mr-2' />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete{' '}
                  <strong>{data.coupon.code}</strong>? This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                >
                  {deleteMutation.isPending && (
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  )}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
                  <Label htmlFor='scopeId'>Scope ID</Label>
                  <Input
                    id='scopeId'
                    value={scopeId}
                    onChange={(e) => setScopeId(e.target.value)}
                  />
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Auto Apply</Label>
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

              <div className='pt-4'>
                <p className='text-xs text-muted-foreground mb-4'>
                  Used {data.coupon._count?.usages ?? 0} time
                  {data.coupon._count?.usages !== 1 ? 's' : ''}
                </p>
                <div className='flex items-center gap-3'>
                  <Button
                    type='submit'
                    disabled={updateMutation.isPending || !code.trim() || !value}
                  >
                    {updateMutation.isPending && (
                      <span className='w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent' />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => navigate({ to: '/dashboard/admin/coupons' })}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
