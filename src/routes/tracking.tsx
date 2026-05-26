import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tracking')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/tracking"!</div>;
}
