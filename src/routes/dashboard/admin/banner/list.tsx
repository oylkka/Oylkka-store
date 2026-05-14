import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/admin/banner/list')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/dashboard/admin/banner/list"!</div>;
}
