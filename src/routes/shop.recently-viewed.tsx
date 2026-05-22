import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Clock, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface RecentProduct {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  viewedAt: number;
}

const STORAGE_KEY = 'oylkka_recently_viewed';
const MAX_ITEMS = 20;

export const Route = createFileRoute('/shop/recently-viewed')({
  component: RouteComponent,
});

function getStored(): RecentProduct[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function trackProductView(product: Omit<RecentProduct, 'viewedAt'>) {
  try {
    const items = getStored().filter((p) => p.id !== product.id);
    items.unshift({ ...product, viewedAt: Date.now() });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items.slice(0, MAX_ITEMS)),
    );
  } catch {}
}

function RouteComponent() {
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    setItems(getStored());
  }, []);

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  };

  return (
    <div className='max-w-4xl mx-auto px-4 py-8 space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' asChild className='shrink-0'>
            <Link to='/products'>
              <ArrowLeft className='w-4 h-4' />
            </Link>
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
              <Eye className='w-6 h-6' />
              Recently Viewed
            </h1>
          </div>
        </div>
        {items.length > 0 && (
          <Button variant='outline' size='sm' onClick={clear}>
            Clear History
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-16 text-center'>
            <Clock className='w-10 h-10 text-muted-foreground mb-3' />
            <p className='text-sm font-semibold'>No recently viewed items</p>
            <p className='text-sm text-muted-foreground mt-1'>
              Products you view will appear here.
            </p>
            <Button asChild className='mt-4' size='sm'>
              <Link to='/products'>Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
          {items.map((item) => (
            <Link
              key={item.id}
              to='/product/$slug'
              params={{ slug: item.slug }}
              className='group'
            >
              <Card className='overflow-hidden hover:shadow-md transition-shadow'>
                <div className='aspect-square bg-muted'>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
                      No image
                    </div>
                  )}
                </div>
                <CardContent className='p-3'>
                  <p className='text-sm font-medium line-clamp-2'>
                    {item.name}
                  </p>
                  <p className='text-sm font-bold mt-1'>
                    BDT {item.price.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
