import { createFileRoute, redirect } from '@tanstack/react-router';

import { ProductEditView } from '@/components/products/product-edit-view';

type ProductEditSearch = {
  productId?: string;
};

export const Route = createFileRoute('/dashboard/admin/products/edit')({
  validateSearch: (search): ProductEditSearch => ({
    productId: search.productId ? String(search.productId) : undefined,
  }),
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
  const { productId } = Route.useSearch();
  return <ProductEditView productId={productId} />;
}
