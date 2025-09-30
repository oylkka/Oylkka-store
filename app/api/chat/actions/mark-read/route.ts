import Ably from 'ably';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/features/auth/get-user';
import { db } from '@/lib/db';

// biome-ignore lint: error
const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, messageIds } = await req.json();
    if (!conversationId || !Array.isArray(messageIds)) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await db.message.updateMany({
      where: {
        id: { in: messageIds },
        conversationId,
        senderId: { not: user.id },
        NOT: { readBy: { has: user.id } },
      },
      data: {
        readBy: { push: user.id },
      },
    });

    await ably.channels
      .get(`private:chat:${conversationId}`)
      .publish('read_receipt', {
        readerId: user.id,
        messageIds,
        conversationId,
      });

    await ably.channels
      .get(`private:unread_count:${user.id}`)
      .publish('unread_update', {
        userId: user.id,
      });

    return NextResponse.json({ success: true });
    // biome-ignore lint: error
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
