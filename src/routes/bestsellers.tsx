import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/bestsellers')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/bestsellers"!</div>;
}
