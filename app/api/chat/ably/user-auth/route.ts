// api/chat/ably/user-auth/route.ts

import Ably from 'ably';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/features/auth/get-user';

// Initialize Ably with your API Key (SERVER-SIDE ONLY)
const ABLY_API_KEY = process.env.ABLY_API_KEY;

if (!ABLY_API_KEY) {
  throw new Error('ABLY_API_KEY environment variable is not set.');
}

const ably = new Ably.Rest(ABLY_API_KEY);

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedUser(req);

    if (!session || !session.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.id;

    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: userId,
      capability: {
        [`user:${userId}`]: ['subscribe'],
      },
      ttl: 60 * 60 * 1000, // 1 hour TTL
    });

    return NextResponse.json(tokenRequest);
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
