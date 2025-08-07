import Ably from 'ably';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/features/auth/auth';

const ABLY_API_KEY = process.env.ABLY_API_KEY;
if (!ABLY_API_KEY) {
  throw new Error('ABLY_API_KEY environment variable is not set.');
}

const ably = new Ably.Rest(ABLY_API_KEY);
// biome-ignore lint: error
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Create token with enhanced presence capabilities
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: session.user.id,
      capability: {
        'presence:global': ['presence', 'subscribe', 'history'],
        'presence:*': ['presence', 'subscribe'],
        'notifications:*': ['subscribe'], // For future features
      },
      ttl: 60 * 60 * 1000, // 1 hour
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
