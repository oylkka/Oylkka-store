import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHome,
});

function DashboardHome() {
  const { user } = Route.useRouteContext();

  return <div>Welcome, {user.name}!</div>;
}
