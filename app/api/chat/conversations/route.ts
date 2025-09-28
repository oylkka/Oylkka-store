import { type NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/features/auth/get-user';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedUser(req);

    if (!session || !session.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const currentUserId = session.id;

    const conversations = await db.conversation.findMany({
      where: {
        OR: [{ user1Id: currentUserId }, { user2Id: currentUserId }],
      },
      include: {
        user1: {
          select: { id: true, name: true, username: true, image: true },
        },
        user2: {
          select: { id: true, name: true, username: true, image: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { id: true, senderId: true, content: true, createdAt: true },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    return NextResponse.json(conversations);
    // biome-ignore lint: error
  } catch (error) {
    return new NextResponse('Internal error', { status: 500 });
  }
}
