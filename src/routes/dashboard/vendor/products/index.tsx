import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';

import { ProductList } from '@/components/products/product-list';
import { Button } from '@/components/ui/button';
import { useVendorProducts } from '@/services/product';

export const Route = createFileRoute('/dashboard/vendor/products/')({
  beforeLoad: ({ context }) => {
    if (!context.user?.role || context.user.role !== 'VENDOR') {
      throw redirect({ to: '/dashboard' });
    }
    return { user: context.user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: products, isLoading, isError, refetch } = useVendorProducts();

  return (
    <ProductList
      title='Products'
      subtitle='Manage your product catalog'
      headerAction={
        <Button
          className='rounded-xl h-10 gap-2'
          onClick={() => navigate({ to: '/dashboard/vendor/products/add' })}
        >
          <Plus className='w-4 h-4' />
          Add Product
        </Button>
      }
      products={products}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
      onEdit={(productId) =>
        navigate({
          to: '/dashboard/vendor/products/edit',
          search: { productId },
        })
      }
    />
  );
}
