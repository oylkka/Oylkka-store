import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/features/auth/get-user';

/**
 * Create a new conversation or get existing one
 */
export async function POST(req: NextRequest) {
  const session = await getAuthenticatedUser(req);

  if (!session?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { recipientId, productId } = await req.json();

    if (!recipientId) {
      return NextResponse.json(
        { message: 'Recipient ID is required' },
        { status: 400 },
      );
    }

    const currentUserId = session.id;

    // Prevent starting conversation with yourself
    if (recipientId === currentUserId) {
      return NextResponse.json(
        { message: 'Cannot start a conversation with yourself' },
        { status: 400 },
      );
    }

    // Check if recipient exists
    const recipient = await db.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return NextResponse.json(
        { message: 'Recipient not found' },
        { status: 404 },
      );
    }

    // Check if conversation already exists
    let conversation = await db.conversation.findFirst({
      where: {
        OR: [
          { user1Id: currentUserId, user2Id: recipientId },
          { user1Id: recipientId, user2Id: currentUserId },
        ],
      },
    });

    // If no existing conversation, create a new one
    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          user1Id: currentUserId,
          user2Id: recipientId,
          lastMessageAt: new Date(),
        },
      });
    }

    // If productId is provided, send initial message about the product
    if (productId) {
      // Get product details
      const product = await db.product.findUnique({
        where: { id: productId },
        select: { productName: true, id: true },
      });

      if (product) {
        // Send a message about the product
        await db.message.create({
          data: {
            conversationId: conversation.id,
            senderId: currentUserId,
            content: `Hi, I'm interested in your product: ${product.productName}`,
          },
        });

        // Update conversation lastMessageAt
        await db.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: new Date() },
        });
      }
    }

    return NextResponse.json(conversation);
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create conversation' },
      { status: 500 },
    );
  }
}

/**
 * Get all conversations for the current user
 */
export async function GET(req: NextRequest) {
  const session = await getAuthenticatedUser(req);

  if (!session?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
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
    return NextResponse.json(
      { message: 'Failed to fetch conversations' },
      { status: 500 },
    );
  }
}
