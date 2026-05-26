import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/size-guide')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/size-guide"!</div>;
}
