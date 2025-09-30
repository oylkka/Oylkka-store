// api/chat/ably/ably-auth/route.ts
import Ably from 'ably';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/features/auth/get-user';
import { db } from '@/lib/db';

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
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { message: 'conversationId is required.' },
        { status: 400 },
      );
    }

    // Optional: Verify user has access to this conversation
    const hasAccess = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });

    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Access denied to this conversation.' },
        { status: 403 },
      );
    }

    // Define Ably token capabilities for the specific channel
    // FIXED: Removed 'private:' prefix to match client channel name
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: userId,
      capability: {
        [`chat:${conversationId}`]: ['publish', 'subscribe', 'presence'],
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
