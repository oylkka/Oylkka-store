import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/careers')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/careers"!</div>;
}
