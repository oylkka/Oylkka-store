import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Check, Package, ShoppingCart, Star, X } from 'lucide-react';
import { motion } from 'motion/react';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAddToCartMutation } from '@/services/cart';
import { useCompareProducts } from '@/services/product';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE, delay },
  }),
};

export const Route = createFileRoute('/compare')({
  component: ComparePage,
  validateSearch: (search: Record<string, string | undefined>) => ({
    ids: search.ids || '',
  }),
});

const specs = [
  { key: 'price', label: 'Price' },
  { key: 'discount', label: 'Discount' },
  { key: 'stock', label: 'Stock' },
  { key: 'brand', label: 'Brand' },
  { key: 'condition', label: 'Condition' },
  { key: 'category', label: 'Category' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'freeShipping', label: 'Free Shipping' },
  { key: 'rating', label: 'Rating' },
] as const;

function ComparePage() {
  const { ids } = Route.useSearch();
  const idList = ids
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const { data, isLoading } = useCompareProducts(idList);
  const addToCart = useAddToCartMutation();

  const products = data?.products ?? [];

  const getValue = (product: (typeof products)[0], key: string) => {
    switch (key) {
      case 'price':
        return (
          <div className='flex items-baseline gap-1.5'>
            <span className='text-lg font-bold tabular-nums'>
              ৳{product.price.toLocaleString()}
            </span>
            {product.discountPrice && (
              <span className='text-sm text-muted-foreground line-through tabular-nums'>
                ৳{product.discountPrice.toLocaleString()}
              </span>
            )}
          </div>
        );
      case 'discount':
        return product.discountPercent ? (
          <span className='text-xs font-semibold bg-destructive/10 text-destructive px-2 py-0.5 rounded-md'>
            -{product.discountPercent}%
          </span>
        ) : (
          <span className='text-xs text-muted-foreground'>—</span>
        );
      case 'stock':
        return product.stock > 0 ? (
          <span className='text-xs font-medium text-primary'>
            In Stock ({product.stock})
          </span>
        ) : (
          <span className='text-xs font-medium text-muted-foreground'>
            Out of Stock
          </span>
        );
      case 'brand':
        return (
          product.brand || <span className='text-muted-foreground'>—</span>
        );
      case 'condition':
        return product.condition.replace(/_/g, ' ');
      case 'category':
        return product.category?.name || '—';
      case 'vendor':
        return product.shop?.name || '—';
      case 'freeShipping':
        return product.freeShipping ? (
          <Check className='w-4 h-4 text-primary' />
        ) : (
          <X className='w-4 h-4 text-muted-foreground' />
        );
      case 'rating':
        return (
          <div className='flex items-center gap-1'>
            <Star className='w-3.5 h-3.5 text-amber-400 fill-amber-400' />
            <span className='text-xs text-muted-foreground'>
              ({product._count.reviews})
            </span>
          </div>
        );
      default:
        return '—';
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      <Header />

      <div className='border-b border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24'>
          <motion.div
            initial='hidden'
            animate='show'
            variants={fadeUp}
            custom={0}
          >
            <Button
              variant='ghost'
              size='sm'
              asChild
              className='mb-8 gap-2 text-primary'
            >
              <Link to='/'>
                <ArrowLeft className='w-3.5 h-3.5' /> Back to Home
              </Link>
            </Button>
          </motion.div>
          <motion.div
            initial='hidden'
            animate='show'
            variants={fadeUp}
            custom={0.08}
          >
            <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight'>
              Compare{' '}
              <span className='italic font-bold text-primary'>Products</span>
              <span className='text-primary'>.</span>
            </h1>
            <p className='text-sm text-muted-foreground mt-3'>
              Compare features and prices side by side to make the best choice.
            </p>
          </motion.div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24'>
        {idList.length < 2 ? (
          <motion.div
            initial='hidden'
            animate='show'
            variants={fadeUp}
            custom={0}
            className='flex flex-col items-center justify-center py-20 gap-4 text-center'
          >
            <div className='w-16 h-16 rounded-2xl bg-muted flex items-center justify-center'>
              <Package className='w-7 h-7 text-muted-foreground' />
            </div>
            <div>
              <p className='text-sm font-semibold'>No products to compare</p>
              <p className='text-sm text-muted-foreground mt-1 max-w-xs'>
                Add product IDs to the URL, e.g.{' '}
                <code className='text-xs bg-muted px-1 py-0.5 rounded'>
                  /compare?ids=id1,id2,id3
                </code>
              </p>
            </div>
            <Button size='sm' asChild className='mt-2'>
              <Link to='/products'>Browse Products</Link>
            </Button>
          </motion.div>
        ) : isLoading ? (
          <div className='space-y-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className='h-12 w-full rounded-xl' />
            ))}
          </div>
        ) : products.length < 2 ? (
          <motion.div
            initial='hidden'
            animate='show'
            variants={fadeUp}
            custom={0}
            className='flex flex-col items-center justify-center py-20 gap-4 text-center'
          >
            <div className='w-16 h-16 rounded-2xl bg-muted flex items-center justify-center'>
              <Package className='w-7 h-7 text-muted-foreground' />
            </div>
            <div>
              <p className='text-sm font-semibold'>Products not found</p>
              <p className='text-sm text-muted-foreground mt-1 max-w-xs'>
                Some products may be unpublished or invalid. Please check the
                IDs.
              </p>
            </div>
            <Button size='sm' asChild className='mt-2'>
              <Link to='/products'>Browse Products</Link>
            </Button>
          </motion.div>
        ) : (
          <div className='overflow-x-auto scrollbar-none'>
            <table className='w-full border-collapse'>
              <thead>
                <tr>
                  <th className='text-left p-4 w-40' />
                  {products.map((product) => (
                    <th
                      key={product.id}
                      className='p-4 min-w-[200px] align-top'
                    >
                      <Link
                        to='/product/$slug'
                        params={{ slug: product.slug }}
                        className='block'
                      >
                        <div className='relative aspect-square rounded-xl overflow-hidden bg-muted mb-3'>
                          {product.images?.[0]?.imageUrl ? (
                            <img
                              src={product.images[0].imageUrl}
                              alt={product.productName}
                              className='object-cover w-full h-full'
                            />
                          ) : (
                            <div className='flex items-center justify-center w-full h-full'>
                              <Package className='w-8 h-8 text-muted-foreground' />
                            </div>
                          )}
                        </div>
                        <h3 className='text-sm font-semibold leading-snug line-clamp-2'>
                          {product.productName}
                        </h3>
                      </Link>
                      <Button
                        size='sm'
                        className='w-full mt-3 gap-1.5 h-8 text-xs'
                        onClick={() =>
                          addToCart.mutate({
                            productId: product.id,
                            quantity: 1,
                            variantId: null,
                          })
                        }
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className='w-3.5 h-3.5' />
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specs.map((spec) => (
                  <tr key={spec.key} className='border-t border-border'>
                    <td className='p-4 text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground'>
                      {spec.label}
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className='p-4 text-sm'>
                        {getValue(product, spec.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
