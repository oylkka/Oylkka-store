import { TanStackDevtools } from '@tanstack/react-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { useState } from 'react';
import { Toaster } from '#/components/ui/sonner';
import { TooltipProvider } from '#/components/ui/tooltip';
import { ThemeProvider } from '#/context/theme-provider';
import { getSession } from '@/lib/auth.functions';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  beforeLoad: async () => {
    const session = await getSession();
    return { user: session?.user ?? null };
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'TanStack Start Starter' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  notFoundComponent: () => (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4'>
      <h1 className='text-4xl font-bold'>404</h1>
      <p className='text-muted-foreground'>Page not found</p>
      <Link to='/' className='text-primary underline-offset-4 hover:underline'>
        Go home
      </Link>
    </div>
  ),
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootComponent() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <ReactQueryDevtools buttonPosition='bottom-left' />
    </QueryClientProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme='system' storageKey='theme'>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors />
        </ThemeProvider>
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
