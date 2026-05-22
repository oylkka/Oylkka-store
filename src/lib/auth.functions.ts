import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';

export const getSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    return session;
  },
);

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  const headers = getRequestHeaders();
  await auth.api.signOut({ headers });
});
