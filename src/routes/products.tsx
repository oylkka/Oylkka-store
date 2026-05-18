import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpDown, ChevronLeft, ChevronRight, PackageX } from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import {
  ProductCard,
  ProductCardSkeleton,
} from '@/components/pages/shop/product-card';
import { Button } from '@/components/ui/button';
import {
  type ProductSortOption,
  useAllProducts,
  usePublicCategories,
} from '@/services/product';

export const Route = createFileRoute('/products')({
  component: RouteComponent,
});

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

function RouteComponent() {
  const [sort, setSort] = useState<ProductSortOption>('newest');
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string | undefined>();

  const { data: listData, isLoading } = useAllProducts({
    sort,
    page,
    limit: 20,
    category: activeCategory,
  });
  const { data: categories } = usePublicCategories();

  const products = listData?.products ?? [];
  const totalPages = listData?.totalPages ?? 1;

  const handleCategoryChange = (slug: string | undefined) => {
    setActiveCategory(slug);
    setPage(1);
  };

  return (
    <div>
      <Header />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24'>
        <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8'>
          <div>
            <div className='flex items-center gap-3 mb-3'>
              <div className='h-px w-8 bg-primary' />
              <span className='text-xs font-semibold tracking-[0.18em] uppercase text-primary'>
                Browse
              </span>
            </div>
            <h2 className='text-2xl md:text-3xl font-bold tracking-tight leading-tight'>
              All{' '}
              <span className='italic font-bold text-primary'>Products</span>
              <span className='text-primary'>.</span>
            </h2>
          </div>

          <div className='flex items-center gap-2'>
            <ArrowUpDown className='w-4 h-4 text-muted-foreground' />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as ProductSortOption);
                setPage(1);
              }}
              className='h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer'
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {categories && categories.length > 0 && (
          <div className='flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap mb-8'>
            <button
              type='button'
              onClick={() => handleCategoryChange(undefined)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-colors duration-200 ${
                !activeCategory
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:border-primary/50 hover:text-primary'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                type='button'
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-colors duration-200 ${
                  activeCategory === cat.slug
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary/50 hover:text-primary'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
            {Array.from({ length: 10 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className='flex items-center justify-center gap-4 mt-12'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className='gap-1'
                >
                  <ChevronLeft className='w-4 h-4' />
                  Previous
                </Button>
                <span className='text-sm text-muted-foreground tabular-nums'>
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className='gap-1'
                >
                  Next
                  <ChevronRight className='w-4 h-4' />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className='flex flex-col items-center justify-center py-20 gap-4 text-center'>
            <div className='w-16 h-16 rounded-2xl bg-muted flex items-center justify-center'>
              <PackageX className='w-7 h-7 text-muted-foreground' />
            </div>
            <div>
              <p className='text-sm font-semibold'>No products found</p>
              <p className='text-sm text-muted-foreground mt-1 max-w-xs'>
                {activeCategory
                  ? 'No products in this category yet. Try a different filter.'
                  : 'No products available yet. Check back soon!'}
              </p>
            </div>
            <Button size='sm' asChild className='mt-2'>
              <Link to='/'>Browse Home</Link>
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
