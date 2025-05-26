import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId } = await context.params;
  const currentUserId = session.user.id;

  try {
    // Fetch conversation with both users included
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user1: {
          select: { id: true, name: true, username: true, image: true },
        },
        user2: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { message: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Verify the current user is part of the conversation
    if (
      conversation.user1Id !== currentUserId &&
      conversation.user2Id !== currentUserId
    ) {
      return NextResponse.json(
        { message: 'Forbidden: You are not part of this conversation.' },
        { status: 403 }
      );
    }

    // Determine the other user
    const otherUser =
      conversation.user1Id === currentUserId
        ? conversation.user2
        : conversation.user1;

    // Return the conversation with the other user
    const response = {
      id: conversation.id,
      otherUser,
      createdAt: conversation.createdAt,
      lastMessageAt: conversation.lastMessageAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error fetching conversation ${conversationId}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch conversation.' },
      { status: 500 }
    );
  }
}
