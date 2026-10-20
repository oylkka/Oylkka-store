import { getRequestHeaders } from '@tanstack/react-start/server';

import { auth } from '@/lib/auth';
import { adminLimiter } from '@/lib/rate-limit';
import { checkRateLimit } from '@/lib/rate-limit-guard';
import type { UserRole } from '@/lib/roles';
import { USER_ROLES } from '@/lib/roles';

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

const STAFF_ROLES: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
  USER_ROLES.CUSTOMER_SERVICE,
];

export async function requireAuth(): Promise<
  | { session: NonNullable<Session>; response: null }
  | { session: null; response: Response }
> {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    return {
      session: null,
      response: Response.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  // AUTH-09: every admin/staff request is rate-limited per actor. Because all
  // admin routes authenticate through this helper, the limiter is applied
  // here rather than duplicated across ~29 endpoints.
  if (STAFF_ROLES.includes(session.user.role as UserRole)) {
    const limited = await checkRateLimit(adminLimiter, session.user.id);
    if (limited) {
      return { session: null, response: limited };
    }
  }

  return { session: session as NonNullable<Session>, response: null };
}

const forbiddenResponse = () =>
  Response.json({ error: 'Forbidden' }, { status: 403 });

export function requireRole(
  session: NonNullable<Session>,
  ...roles: UserRole[]
): Response | null {
  if (!roles.includes(session.user.role as UserRole)) {
    return forbiddenResponse();
  }
  return null;
}

export function requireAdmin(session: NonNullable<Session>): Response | null {
  return requireRole(session, USER_ROLES.ADMIN);
}

export function requireStaff(session: NonNullable<Session>): Response | null {
  return requireRole(
    session,
    USER_ROLES.ADMIN,
    USER_ROLES.MANAGER,
    USER_ROLES.CUSTOMER_SERVICE,
  );
}

/**
 * The admin console audience: ADMIN and MANAGER.
 *
 * `CUSTOMER_SERVICE` is staff for rate-limiting (`requireAuth`) and for the
 * support inbox (`requireStaff`), but it has no console destinations and must
 * not pick up console powers — catalog control included — by accident. This is
 * the single list every "may act on any product" check reads, so the vendor
 * endpoints (`delete`, `edit`, `get-single`) and the admin ones cannot drift.
 */
export function isAdminOrManager(session: NonNullable<Session>): boolean {
  return (
    session.user.role === USER_ROLES.ADMIN ||
    session.user.role === USER_ROLES.MANAGER
  );
}

export function requireAdminOrManager(
  session: NonNullable<Session>,
): Response | null {
  return isAdminOrManager(session) ? null : forbiddenResponse();
}
