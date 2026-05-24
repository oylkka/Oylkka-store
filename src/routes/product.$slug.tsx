import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  BadgeCheck,
  Clock,
  Heart,
  HelpCircle,
  Loader2,
  MapPin,
  MessageSquare,
  Minus,
  PackageX,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { ProductDescription } from '@/components/pages/product/product-description';
import { ProductGallery } from '@/components/pages/product/product-gallery';
import { ProductInfo } from '@/components/pages/product/product-info';
import { ProductQuestions } from '@/components/pages/product/product-questions';
import { ProductRelated } from '@/components/pages/product/product-related';
import { ProductVariantPicker } from '@/components/pages/product/product-variant-picker';
import { ProductVendorCard } from '@/components/pages/product/product-vendor-card';
import { ProductReviews } from '@/components/pages/product/review';
import { StockStatus } from '@/components/pages/product/stock-status';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAddToCartMutation } from '@/services/cart';
import { usePublicProduct } from '@/services/product';
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useWishlist,
} from '@/services/wishlist';
import { trackProductView } from './shop.recently-viewed';

export const Route = createFileRoute('/product/$slug')({
  component: RouteComponent,
});

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE, delay },
  }),
};

const slideIn = {
  hidden: { opacity: 0, x: -16 },
  show: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: EASE, delay },
  }),
};

function SectionHeader({
  label,
  icon: Icon,
}: {
  label: string;
  icon?: React.ElementType;
}) {
  return (
    <div className='flex items-center gap-4 mb-8'>
      <div className='h-8 w-1 rounded-full bg-primary' />
      <div className='flex items-center gap-2.5'>
        {Icon && <Icon className='w-4 h-4 text-primary' />}
        <span className='text-xs font-semibold tracking-[0.2em] uppercase text-primary'>
          {label}
        </span>
      </div>
      <div className='flex-1 h-px bg-border' />
    </div>
  );
}

function RouteComponent() {
  const { slug } = Route.useParams();
  const { user } = Route.useRouteContext();
  const { data: product, isLoading, isError } = usePublicProduct(slug);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<{
    id: string;
    price: number;
    stock: number;
  } | null>(null);
  const addToCart = useAddToCartMutation();
  const addToWishlist = useAddToWishlistMutation();
  const removeFromWishlist = useRemoveFromWishlistMutation();
  const { data: wishlistData } = useWishlist({
    enabled: !!user,
  });

  useEffect(() => {
    if (product) {
      trackProductView({
        id: product.id,
        slug: product.slug,
        name: product.productName,
        image: product.images?.[0]?.imageUrl ?? '',
        price: product.discountPrice ?? product.price,
      });
    }
  }, [product]);

  const isInWishlist = wishlistData?.items?.some(
    (item) =>
      item.productId === product?.id &&
      item.variantId === (selectedVariant?.id ?? null),
  );

  function handleToggleWishlist() {
    if (!user) {
      toast.error('Please sign in to add items to your wishlist');
      return;
    }
    if (!product) return;

    if (isInWishlist) {
      removeFromWishlist.mutate({
        productId: product.id,
        variantId: selectedVariant?.id,
      });
    } else {
      addToWishlist.mutate({
        productId: product.id,
        variantId: selectedVariant?.id,
      });
    }
  }

  if (isLoading) return <PdpSkeleton />;
  if (isError || !product) return <PdpNotFound />;

  const currentStock = selectedVariant?.stock ?? product.stock;

  const trustItems = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over ৳500' },
    {
      icon: ShieldCheck,
      title: 'Secure Payment',
      desc: 'SSL encrypted checkout',
    },
    { icon: MapPin, title: 'Trackable', desc: 'Real-time order tracking' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
  ];

  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <motion.div
        initial='hidden'
        animate='show'
        variants={fadeUp}
        custom={0}
        className='w-full border-b border-border bg-card/50'
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3'>
          <Breadcrumb>
            <BreadcrumbList className='text-xs'>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to='/' className='hover:text-primary transition-colors'>
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to='/products/category/$slug'
                    params={{ slug: product.category.slug }}
                    className='hover:text-primary transition-colors'
                  >
                    {product.category.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className='truncate max-w-[160px] font-medium text-foreground'>
                  {product.productName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </motion.div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16'>
          <motion.div
            initial='hidden'
            animate='show'
            variants={slideIn}
            custom={0}
            className='lg:sticky lg:top-24 lg:self-start'
          >
            <ProductGallery
              images={product.images}
              productName={product.productName}
              discountPercent={product.discountPercent}
            />
          </motion.div>

          <motion.div
            initial='hidden'
            animate='show'
            variants={fadeUp}
            custom={0.1}
            className='flex flex-col gap-6'
          >
            <ProductInfo product={product} />

            {product.hasVariants && product.attributeOptions.length > 0 && (
              <div className='rounded-2xl border border-border bg-card p-5'>
                <ProductVariantPicker
                  attributeOptions={product.attributeOptions}
                  variants={product.variants}
                  basePrice={product.price}
                  baseDiscountPrice={product.discountPrice}
                  onVariantChange={setSelectedVariant}
                />
              </div>
            )}

            {(!product.hasVariants || selectedVariant) && (
              <div className='rounded-2xl border border-border bg-card p-5 space-y-5'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-medium'>Quantity</p>
                  <StockStatus stock={currentStock} lowStockThreshold={5} />
                </div>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center border border-border rounded-xl overflow-hidden'>
                    <button
                      type='button'
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className='w-10 h-10 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                    >
                      <Minus className='w-3.5 h-3.5' />
                    </button>
                    <span className='w-12 text-center text-base font-semibold tabular-nums border-x border-border'>
                      {quantity}
                    </span>
                    <button
                      type='button'
                      onClick={() =>
                        setQuantity((p) => Math.min(currentStock, p + 1))
                      }
                      className='w-10 h-10 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                    >
                      <Plus className='w-3.5 h-3.5' />
                    </button>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {currentStock} available
                  </p>
                </div>

                <Separator />

                <div className='space-y-1'>
                  <div className='flex items-baseline gap-3'>
                    <span className='text-3xl font-bold tabular-nums text-foreground'>
                      ৳
                      {(
                        product.discountPrice ?? product.price
                      ).toLocaleString()}
                    </span>
                    {product.discountPrice && (
                      <span className='text-lg text-muted-foreground line-through tabular-nums'>
                        ৳{product.price.toLocaleString()}
                      </span>
                    )}
                    {product.discountPercent && (
                      <span className='text-xs font-bold bg-red-500/10 text-red-500 px-2.5 py-1 rounded-full border border-red-500/20'>
                        Save {product.discountPercent}%
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Inclusive of all taxes
                  </p>
                </div>
              </div>
            )}

            <div className='flex flex-col gap-3'>
              <div className='flex gap-3'>
                <Button
                  size='lg'
                  className='flex-1 gap-2.5 h-12 text-base rounded-xl'
                  disabled={
                    currentStock <= 0 ||
                    (product.hasVariants && !selectedVariant)
                  }
                  onClick={() =>
                    addToCart.mutate({
                      productId: product.id,
                      variantId: selectedVariant?.id,
                      quantity,
                    })
                  }
                >
                  <ShoppingCart className='w-5 h-5' />
                  {currentStock <= 0
                    ? 'Out of Stock'
                    : product.hasVariants && !selectedVariant
                      ? 'Select Options'
                      : 'Add to Cart'}
                </Button>
                <Button
                  variant='outline'
                  size='icon'
                  className={cn(
                    'h-12 w-12 shrink-0 rounded-xl transition-colors',
                    isInWishlist &&
                      'text-red-500 border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:hover:bg-red-900',
                  )}
                  onClick={handleToggleWishlist}
                  disabled={
                    addToWishlist.isPending || removeFromWishlist.isPending
                  }
                >
                  <Heart
                    className={cn('w-5 h-5', isInWishlist && 'fill-current')}
                  />
                </Button>
              </div>

              <div className='flex items-center justify-center gap-6 py-2 text-xs text-muted-foreground'>
                <span className='flex items-center gap-1.5'>
                  <BadgeCheck className='w-3.5 h-3.5 text-emerald-500' />
                  Secure checkout
                </span>
                <span className='flex items-center gap-1.5'>
                  <Clock className='w-3.5 h-3.5 text-emerald-500' />
                  Fast delivery
                </span>
                <span className='flex items-center gap-1.5'>
                  <RefreshCw className='w-3.5 h-3.5 text-emerald-500' />
                  Easy returns
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 my-16'>
          <div className='lg:col-span-2 space-y-16'>
            <motion.div
              initial='hidden'
              whileInView='show'
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              custom={0}
            >
              <SectionHeader label='Description' icon={Sparkles} />
              <div className='bg-card border border-border rounded-2xl p-6 md:p-8'>
                <ProductDescription product={product} />
              </div>
            </motion.div>

            <motion.div
              initial='hidden'
              whileInView='show'
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              custom={0}
              className='scroll-mt-24'
              id='reviews'
            >
              <SectionHeader label={`Reviews (${product._count.reviews})`} />
              <div className='bg-card border border-border rounded-2xl p-6 md:p-8'>
                <ProductReviews
                  productId={product.id}
                  totalReviewCount={product._count.reviews}
                  ratingBreakdown={product.ratingBreakdown}
                />
              </div>
            </motion.div>

            <motion.div
              initial='hidden'
              whileInView='show'
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              custom={0}
            >
              <SectionHeader label='Shipping & Returns' />
              <div className='bg-card border border-border rounded-2xl p-6 md:p-8'>
                <div className='grid md:grid-cols-2 gap-8'>
                  <div className='space-y-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
                        <Truck className='w-5 h-5 text-primary' />
                      </div>
                      <div>
                        <p className='text-sm font-semibold'>
                          Shipping Information
                        </p>
                        {product.freeShipping && (
                          <p className='text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                            Free shipping available
                          </p>
                        )}
                      </div>
                    </div>
                    <div className='space-y-3 text-sm text-muted-foreground leading-relaxed ml-[52px]'>
                      <p>
                        Orders are processed within 1-2 business days. Standard
                        shipping takes 5-7 business days. Express shipping is
                        available at checkout for an additional fee.
                      </p>
                      <ul className='space-y-2'>
                        {product.weight && (
                          <li className='flex items-center gap-2'>
                            <span className='w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0' />
                            Package weight: {product.weight}{' '}
                            {product.weightUnit}
                          </li>
                        )}
                        {product.dimensionLength &&
                          product.dimensionWidth &&
                          product.dimensionHeight && (
                            <li className='flex items-center gap-2'>
                              <span className='w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0' />
                              Package dimensions: {product.dimensionLength} ×{' '}
                              {product.dimensionWidth} ×{' '}
                              {product.dimensionHeight} {product.dimensionUnit}
                            </li>
                          )}
                        <li className='flex items-center gap-2'>
                          <span className='w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0' />
                          Tracking information sent via email
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
                        <RefreshCw className='w-5 h-5 text-primary' />
                      </div>
                      <div>
                        <p className='text-sm font-semibold'>Return Policy</p>
                        <p className='text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                          30-day money-back guarantee
                        </p>
                      </div>
                    </div>
                    <div className='space-y-3 text-sm text-muted-foreground leading-relaxed ml-[52px]'>
                      <p>
                        We accept returns within 30 days of delivery. Items must
                        be unused and in their original packaging.
                      </p>
                      <ul className='space-y-2'>
                        <li className='flex items-center gap-2'>
                          <span className='w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0' />
                          Free return shipping on defective items
                        </li>
                        <li className='flex items-center gap-2'>
                          <span className='w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0' />
                          Refunds processed within 5-7 business days
                        </li>
                        <li className='flex items-center gap-2'>
                          <span className='w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0' />
                          Contact support to initiate a return
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className='lg:sticky lg:top-24 lg:self-start space-y-8'>
            {product.shop && (
              <motion.div
                initial='hidden'
                whileInView='show'
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                custom={0}
              >
                <SectionHeader label='Seller' icon={BadgeCheck} />
                <div className='space-y-3'>
                  <ProductVendorCard shop={product.shop} />
                  <ContactVendorDialog
                    shopId={product.shop.id}
                    shopName={product.shop.name}
                    productId={product.id}
                  />
                </div>
              </motion.div>
            )}

            <motion.div
              initial='hidden'
              whileInView='show'
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              custom={0.05}
            >
              <SectionHeader label='Ask a Question' icon={HelpCircle} />
              <div className='bg-card border border-border rounded-2xl p-4'>
                <ProductQuestions productId={product.id} />
              </div>
            </motion.div>

            <motion.div
              initial='hidden'
              whileInView='show'
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              custom={0.1}
            >
              <SectionHeader label='Why Shop With Us' />
              <div className='space-y-3'>
                {trustItems.map((item) => (
                  <div
                    key={item.title}
                    className='flex items-center gap-3 p-3 rounded-xl border border-border bg-card'
                  >
                    <div className='w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0'>
                      <item.icon className='w-4 h-4 text-primary' />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-sm font-semibold'>{item.title}</p>
                      <p className='text-xs text-muted-foreground'>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial='hidden'
          whileInView='show'
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          custom={0}
        >
          <ProductRelated
            categorySlug={product.category.slug}
            currentProductId={product.id}
          />
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

function ContactVendorDialog({
  shopId,
  shopName,
  productId,
}: {
  shopId: string;
  shopName: string;
  productId?: string;
}) {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSend() {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    if (!user) {
      toast.error('Please sign in to message a seller');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          subject: subject.trim(),
          message: message.trim(),
          productId: productId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to send message');
        return;
      }

      toast.success('Message sent!');
      setOpen(false);
      setSubject('');
      setMessage('');
      navigate({
        to: '/dashboard/messages/$id',
        params: { id: data.conversation.id },
      });
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='w-full gap-2 rounded-xl'>
          <MessageSquare className='w-4 h-4' />
          Message Seller
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Message {shopName}</DialogTitle>
          <DialogDescription>
            Send a message to the seller about this product.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor='subject'>Subject</FieldLabel>
            <Input
              id='subject'
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder='e.g. Question about product'
              maxLength={200}
            />
            {subject.length > 180 && (
              <FieldError>Maximum 200 characters</FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor='message'>Message</FieldLabel>
            <textarea
              id='message'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder='Write your message here...'
              className='flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
              maxLength={2000}
            />
            {message.length > 1900 && (
              <FieldError>Maximum 2,000 characters</FieldError>
            )}
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button
            onClick={handleSend}
            disabled={isSending || !subject.trim() || !message.trim()}
            className='gap-2'
          >
            {isSending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Send className='h-4 w-4' />
            )}
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PdpSkeleton() {
  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <div className='w-full border-b border-border bg-card/50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3'>
          <Skeleton className='h-3 w-64' />
        </div>
      </div>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16'>
          <div className='space-y-4'>
            <Skeleton className='aspect-square w-full rounded-2xl' />
            <div className='flex gap-3'>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className='w-20 h-20 rounded-lg' />
              ))}
            </div>
          </div>
          <div className='space-y-6'>
            <Skeleton className='h-5 w-24 rounded-full' />
            <Skeleton className='h-9 w-3/4' />
            <Skeleton className='h-4 w-48' />
            <Skeleton className='h-10 w-36' />
            <Skeleton className='h-5 w-20' />
            <Skeleton className='h-32 w-full rounded-2xl' />
            <div className='flex gap-3'>
              <Skeleton className='h-12 flex-1 rounded-xl' />
              <Skeleton className='h-12 w-12 rounded-xl' />
            </div>
          </div>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mb-16'>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className='h-28 rounded-2xl' />
          ))}
        </div>
        <Skeleton className='h-48 w-full rounded-2xl mb-16' />
        <Skeleton className='h-64 w-full rounded-2xl mb-16' />
        <Skeleton className='h-64 w-full rounded-2xl mb-16' />
        <Skeleton className='h-64 w-full rounded-2xl' />
      </div>
      <Footer />
    </div>
  );
}

function PdpNotFound() {
  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24'>
        <div className='flex flex-col items-center justify-center py-20 gap-5 text-center'>
          <div className='w-20 h-20 rounded-2xl bg-muted flex items-center justify-center'>
            <PackageX className='w-9 h-9 text-muted-foreground' />
          </div>
          <div className='max-w-sm'>
            <p className='text-lg font-semibold'>Product not found</p>
            <p className='text-sm text-muted-foreground mt-1.5'>
              The product you're looking for doesn't exist or has been removed.
            </p>
          </div>
          <Button asChild className='mt-2 rounded-xl'>
            <Link to='/'>Browse Home</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
