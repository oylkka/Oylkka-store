import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from './auth.config';

// Initialize NextAuth with the given configuration.
// Expose the auth middleware function for protecting routes.
export const { auth } = NextAuth(authConfig);

/**
 * List of public routes where authentication is not required.
 * @type {string[]}
 */
const publicRoutes = ['/sign-in', '/sign-up'];

/**
 * List of protected routes that require the user to be authenticated.
 * Routes in this list should redirect unauthenticated users to the sign-in page.
 * @type {string[]}
 */
const protectedRoutes = ['/dashboard', '/profile'];

/**
 * Prefix used to identify API routes.
 * API routes are handled differently in terms of security and authentication.
 * @type {string}
 */
const apiPrefix = '/api';

/**
 * NextAuth middleware to handle authentication and routing based on login status.
 *
 * This middleware does the following:
 *  - Checks if the current request is for an API route and sets security headers.
 *  - Allows signed-in users to be redirected away from sign-in/up pages.
 *  - Redirects unauthenticated users attempting to access protected pages.
 *  - Redirects authenticated users from the home page to their dashboard.
 *
 * @param {Request} req - The incoming Next.js request object.
 * @returns {NextResponse} - The response with appropriate redirection or next middleware.
 */
export default auth(async (req) => {
  const { nextUrl } = req;
  // Determine if the user is authenticated based on auth data provided in the request.
  const isLoggedIn = !!req.auth;
  // Check if the request is targeting an API route.
  const isApiRoute = nextUrl.pathname.startsWith(apiPrefix);
  // Check if the request targets a public route.
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  // Check if the request targets a protected route.
  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // ============================================================
  // API Routes
  // ============================================================
  // For API routes, bypass the usual authentication check.
  // Instead, add security headers and continue to the next handler.
  if (isApiRoute) {
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    return response;
  }

  // ============================================================
  // Auth Routes (Sign-in and Sign-up)
  // ============================================================
  // If a user is already logged in, redirect them away from the auth pages
  // to prevent unnecessary access.
  if (isPublicRoute) {
    if (isLoggedIn) {
      // Redirect logged-in user to the dashboard.
      return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
    }
    // Allow the user to access public pages if not authenticated.
    return NextResponse.next();
  }

  // ============================================================
  // Protected Routes
  // ============================================================
  // If an unauthenticated user tries to access a protected route,
  // redirect them to the sign-in page with a callback URL parameter.
  if (!isLoggedIn && isProtectedRoute) {
    const signInUrl = new URL('/sign-in', nextUrl.origin);
    signInUrl.searchParams.set('callbackUrl', nextUrl.toString());
    return NextResponse.redirect(signInUrl);
  }

  // ============================================================
  // Default: Allow the request to proceed.
  // ============================================================
  return NextResponse.next();
});

/**
 * Next.js Middleware Config
 *
 * The `matcher` property defines the paths that the middleware will be applied to.
 * It avoids running middleware for Next.js internals or static files unless specified.
 */
export const config = {
  matcher: [
    // This regex excludes internal Next.js paths and static resources, while allowing search parameters.
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run middleware for API routes.
    '/(api|trpc)(.*)',
  ],
};
