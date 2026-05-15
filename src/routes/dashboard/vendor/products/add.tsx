import { createFileRoute, redirect } from '@tanstack/react-router';

import { NewProductPage } from '@/components/forms/product/product-page';

export const Route = createFileRoute('/dashboard/vendor/products/add')({
  beforeLoad: ({ context }) => {
    if (!context.user?.role || context.user.role !== 'VENDOR') {
      throw redirect({ to: '/dashboard' });
    }
    return { user: context.user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <NewProductPage />;
}
