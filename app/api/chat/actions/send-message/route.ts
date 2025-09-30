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

    const { conversationId, content } = await req.json();
    if (!conversationId || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      select: { user1Id: true, user2Id: true },
    });

    if (
      !conversation ||
      (conversation.user1Id !== user.id && conversation.user2Id !== user.id)
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const newMessage = await db.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });

    await db.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    const recipientId =
      conversation.user1Id === user.id
        ? conversation.user2Id
        : conversation.user1Id;

    await ably.channels
      .get(`private:chat:${conversationId}`)
      .publish('message', newMessage);
    await ably.channels
      .get(`private:unread_count:${recipientId}`)
      .publish('unread_update', {
        userId: recipientId,
      });

    const updatedConversation = await db.conversation.findUnique({
      where: { id: conversationId },
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
    });

    await ably.channels
      .get(`user:${recipientId}`)
      .publish('new-message', updatedConversation);
    await ably.channels
      .get(`user:${user.id}`)
      .publish('new-message', updatedConversation);

    return NextResponse.json(newMessage);
    // biome-ignore lint: error
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
