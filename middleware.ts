import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from './auth.config';

export const { auth } = NextAuth(authConfig);

// Improved route configuration
const publicRoutes = ['/', '/sign-in', '/sign-up'];
const protectedRoutes = ['/dashboard', '/profile'];
const apiPrefix = '/api';

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiRoute = nextUrl.pathname.startsWith(apiPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Allow API routes to bypass authentication (handle auth in individual endpoints)
  if (isApiRoute) {
    // Add security headers for API routes
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    return response;
  }

  // Handle auth routes
  if (nextUrl.pathname === '/sign-in' || nextUrl.pathname === '/sign-up') {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (!isLoggedIn && isProtectedRoute) {
    const signInUrl = new URL('/sign-in', nextUrl.origin);
    signInUrl.searchParams.set('callbackUrl', nextUrl.toString());
    return NextResponse.redirect(signInUrl);
  }

  // Redirect logged-in users from home to dashboard
  if (isLoggedIn && nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
  }

  // Allow public routes and non-protected routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
