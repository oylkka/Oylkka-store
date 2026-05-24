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
import { useTranslation } from 'react-i18next';
import { Toaster } from '#/components/ui/sonner';
import { TooltipProvider } from '#/components/ui/tooltip';
import { ThemeProvider } from '#/context/theme-provider';
import { RouteErrorBoundary } from '@/components/error-boundary';
import { getSession } from '@/lib/auth.functions';
import '@/lib/i18n';
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
      { title: 'Oylkka — Bangladesh Marketplace' },
      {
        name: 'description',
        content:
          'Shop thousands of products from verified vendors across Bangladesh. Fast delivery, secure payments, and easy returns on Oylkka.',
      },
      { property: 'og:title', content: 'Oylkka — Bangladesh Marketplace' },
      {
        property: 'og:description',
        content:
          'Shop thousands of products from verified vendors across Bangladesh. Fast delivery, secure payments, and easy returns.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: '/og-image.svg' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Oylkka — Bangladesh Marketplace' },
      {
        name: 'twitter:description',
        content:
          'Shop thousands of products from verified vendors across Bangladesh.',
      },
      { name: 'twitter:image', content: '/og-image.svg' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'canonical', href: 'https://oylkka.com' },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
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
  errorComponent: RouteErrorBoundary,
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
  const { i18n } = useTranslation();
  return (
    <html lang={i18n.language || 'en'} suppressHydrationWarning>
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
