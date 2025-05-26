// api/chat/ably/ably-auth/route.ts
import Ably from 'ably';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';

// Initialize Ably with your API Key (SERVER-SIDE ONLY)
const ABLY_API_KEY = process.env.ABLY_API_KEY;

if (!ABLY_API_KEY) {
  throw new Error('ABLY_API_KEY environment variable is not set.');
}

const ably = new Ably.Rest(ABLY_API_KEY);

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { message: 'conversationId is required.' },
        { status: 400 }
      );
    }

    // Optional: Verify user has access to this conversation
    // You might want to add this check based on your database

    const hasAccess = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });

    if (!hasAccess) {
      console.error(
        '❌ User does not have access to conversation:',
        conversationId
      );
      return NextResponse.json(
        { message: 'Access denied to this conversation.' },
        { status: 403 }
      );
    }

    // Define Ably token capabilities for the specific private channel
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: userId,
      capability: {
        [`private:chat:${conversationId}`]: [
          'publish',
          'subscribe',
          'presence',
        ],
      },
      ttl: 60 * 60 * 1000, // 1 hour TTL
    });

    return NextResponse.json(tokenRequest);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
