import { getRequestHeaders } from '@tanstack/react-start/server';

import { auth } from '@/lib/auth';
import type { UserRole } from '@/lib/roles';
import { USER_ROLES } from '@/lib/roles';

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

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

  return { session: session as NonNullable<Session>, response: null };
}

export function requireRole(
  session: NonNullable<Session>,
  ...roles: UserRole[]
): Response | null {
  if (!roles.includes(session.user.role as UserRole)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
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

export function requireAdminOrManager(
  session: NonNullable<Session>,
): Response | null {
  return requireRole(session, USER_ROLES.ADMIN, USER_ROLES.MANAGER);
}
