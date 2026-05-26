import { createFileRoute, Outlet } from '@tanstack/react-router';
import { RouteErrorBoundary } from '@/components/error-boundary';

export const Route = createFileRoute('/dashboard/admin')({
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
