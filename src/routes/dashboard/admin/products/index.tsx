import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';

import { ProductList } from '@/components/products/product-list';
import { useAdminProducts } from '@/services/product';

export const Route = createFileRoute('/dashboard/admin/products/')({
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
  const { data: products, isLoading, isError, refetch } = useAdminProducts();

  return (
    <ProductList
      title='All Products'
      subtitle='Moderate every listing across all shops'
      products={products}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
      onEdit={(productId) =>
        navigate({
          to: '/dashboard/admin/products/edit',
          search: { productId },
        })
      }
      emptyHint='No listings on the platform yet.'
    />
  );
}
