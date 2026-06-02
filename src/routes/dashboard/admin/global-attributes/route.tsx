import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { RouteErrorBoundary } from '@/components/error-boundary';

export const Route = createFileRoute('/dashboard/admin/global-attributes')({
  beforeLoad: ({ context }) => {
    if (
      !context.user?.role ||
      (context.user.role !== 'ADMIN' && context.user.role !== 'MANAGER')
    ) {
      throw redirect({ to: '/dashboard' });
    }
    return { user: context.user };
  },
  errorComponent: RouteErrorBoundary,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
