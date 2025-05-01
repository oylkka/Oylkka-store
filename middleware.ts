import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from './features/auth/auth.config';

// Initialize NextAuth middleware
export const { auth } = NextAuth(authConfig);

/**
 * Define public routes that don't require authentication.
 */
const publicRoutes = ['/sign-in', '/sign-up'];

/**
 * Define routes that require authentication.
 */
const protectedRoutes = ['/dashboard', '/profile'];

/**
 * Define routes that are exempt from onboarding checks.
 */
const onboardingExemptRoutes = ['/onboarding', ...publicRoutes];

/**
 * Prefix to identify API routes.
 */
const apiPrefix = '/api';

/**
 * Main middleware handler.
 */
export default auth(async (req) => {
  const { nextUrl } = req;

  const isLoggedIn = !!req.auth;
  const hasOnboarded = req.auth?.user?.hasOnboarded ?? true;
  const isAdmin = req.auth?.user?.role === 'ADMIN';

  const isApiRoute = nextUrl.pathname.startsWith(apiPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isOnboardingExempt =
    onboardingExemptRoutes.some((route) =>
      nextUrl.pathname.startsWith(route)
    ) || isApiRoute;

  // ==============================
  // API ROUTES
  // ==============================
  if (isApiRoute) {
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    return response;
  }

  // ==============================
  // PUBLIC ROUTES
  // ==============================
  if (isPublicRoute) {
    if (isLoggedIn) {
      if (!hasOnboarded) {
        return NextResponse.redirect(new URL('/onboarding', nextUrl.origin));
      }
      return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
    }
    return NextResponse.next(); // Allow access to public page
  }

  // ==============================
  // PROTECTED ROUTES
  // ==============================
  if (!isLoggedIn && isProtectedRoute) {
    const signInUrl = new URL('/sign-in', nextUrl.origin);
    signInUrl.searchParams.set('callbackUrl', nextUrl.toString());
    return NextResponse.redirect(signInUrl);
  }

  // ==============================
  // ADMIN ROUTE PROTECTION
  // ==============================
  if (
    nextUrl.pathname.startsWith('/dashboard/admin') &&
    (!isLoggedIn || !isAdmin)
  ) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
  }

  // ==============================
  // ONBOARDING CHECK
  // ==============================
  if (isLoggedIn && !hasOnboarded && !isOnboardingExempt) {
    return NextResponse.redirect(new URL('/onboarding', nextUrl.origin));
  }

  if (
    isLoggedIn &&
    hasOnboarded &&
    nextUrl.pathname.startsWith('/onboarding')
  ) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
  }

  if (!isLoggedIn && nextUrl.pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/sign-in', nextUrl.origin));
  }

  // ==============================
  // ALLOW REQUEST
  // ==============================
  return NextResponse.next();
});

/**
 * Middleware Config
 *
 * The matcher determines which routes this middleware will apply to.
 * It avoids Next.js internals and static files.
 */
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
