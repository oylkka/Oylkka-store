import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// Define a type for our user payload for consistency
interface UserPayload {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
}

/**
 * Verifies the JWT from the Authorization header.
 * @param req The NextRequest object.
 * @returns The user payload if the token is valid, otherwise null.
 */
async function verifyJwt(req: NextRequest): Promise<UserPayload | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    // Fetch the latest user data from the database
    const user = await db.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Gets the authenticated user from either the NextAuth session or a JWT.
 * This allows the same API route to be used by the web app and mobile app.
 * @param req The NextRequest object.
 * @returns The user object or null if not authenticated.
 */
export async function getAuthenticatedUser(
  req: NextRequest
): Promise<UserPayload | null> {
  // 1. Try to get the user from the NextAuth session (for web)
  const session = await auth();
  if (session && session.user) {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    };
  }

  // 2. If no session, try to get the user from the JWT (for mobile)
  const userFromJwt = await verifyJwt(req);
  if (userFromJwt) {
    return userFromJwt;
  }

  // 3. If neither method works, the user is not authenticated
  return null;
}
