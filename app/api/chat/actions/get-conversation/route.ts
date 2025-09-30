import { type NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/features/auth/get-user';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientId } = await req.json();
    if (!recipientId || recipientId === user.id) {
      return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 });
    }

    let conversation = await db.conversation.findFirst({
      where: {
        OR: [
          { user1Id: user.id, user2Id: recipientId },
          { user1Id: recipientId, user2Id: user.id },
        ],
      },
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          user1Id: user.id,
          user2Id: recipientId,
          lastMessageAt: new Date(),
        },
      });
    }

    return NextResponse.json(conversation);
    // biome-ignore lint: error
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
