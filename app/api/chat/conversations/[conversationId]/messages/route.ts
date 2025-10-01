import { type NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/features/auth/get-user';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ conversationId: string }>;
  },
) {
  const session = await getAuthenticatedUser(req);

  if (!session || !session.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId } = await context.params;
  const currentUserId = session.id;

  // Verify the current user is part of the conversation
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { user1Id: true, user2Id: true },
  });

  if (
    !conversation ||
    (conversation.user1Id !== currentUserId &&
      conversation.user2Id !== currentUserId)
  ) {
    return NextResponse.json(
      { message: 'Forbidden: You are not part of this conversation.' },
      { status: 403 },
    );
  }

  try {
    const messages = await db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderId: true,
        readBy: true,
        sender: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });

    return NextResponse.json(messages);
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch messages.' },
      { status: 500 },
    );
  }
}
