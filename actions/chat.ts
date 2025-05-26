// actions/chat.ts
'use server';
import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import Ably from 'ably';

// Initialize Ably with your API Key for publishing messages server-side
const ABLY_API_KEY = process.env.ABLY_API_KEY;
if (!ABLY_API_KEY) {
  throw new Error('ABLY_API_KEY environment variable is not set.');
}
const ably = new Ably.Rest(ABLY_API_KEY);

// Define a type for the message response, including sender details for real-time updates
interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date; // Server-side, it's a Date object
  sender: {
    id: string;
    name?: string | null;
    username?: string | null;
    image?: string | null;
  };
  readBy?: string[]; // Include readBy for client-side representation if needed
}

/**
 * Server Action to create a new conversation or retrieve an existing one between two users.
 * @param recipientId The ID of the other user in the conversation.
 * @returns The created or existing Conversation object.
 */
export async function createOrGetConversation(recipientId: string) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new Error('Unauthorized');
  }
  const currentUserId = session.user.id;

  if (currentUserId === recipientId) {
    throw new Error('Cannot create conversation with yourself.');
  }

  try {
    // Prisma ensures uniqueness of [user1Id, user2Id] regardless of order
    let conversation = await db.conversation.findFirst({
      where: {
        OR: [
          { user1Id: currentUserId, user2Id: recipientId },
          { user1Id: recipientId, user2Id: currentUserId },
        ],
      },
    });

    if (!conversation) {
      // Create a new conversation if it doesn't exist
      conversation = await db.conversation.create({
        data: {
          user1Id: currentUserId,
          user2Id: recipientId,
          lastMessageAt: new Date(), // Initialize with current time
        },
      });
    }
    return conversation;
  } catch (error) {
    console.error('Error creating/fetching conversation:', error);
    throw new Error('Failed to create or fetch conversation.');
  }
}

/**
 * Server Action to send a new message in a conversation.
 * Saves the message to the database and publishes it to Ably.
 * @param conversationId The ID of the conversation.
 * @param content The message content.
 * @returns The newly created Message object.
 */
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<MessageResponse> {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new Error('Unauthorized');
  }
  const currentUserId = session.user.id;

  if (!content || typeof content !== 'string') {
    throw new Error('Message content is required.');
  }

  // Verify the current user is part of the conversation for security
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { user1Id: true, user2Id: true },
  });

  if (
    !conversation ||
    (conversation.user1Id !== currentUserId &&
      conversation.user2Id !== currentUserId)
  ) {
    throw new Error('Forbidden: You are not part of this conversation.');
  }

  try {
    // 1. Save message to database using Prisma
    const newMessage = await db.message.create({
      data: {
        conversationId: conversationId,
        senderId: currentUserId,
        content: content,
      },
      include: {
        sender: {
          // Include sender details for the real-time update
          select: { id: true, name: true, username: true, image: true },
        },
      },
    });

    // 2. Update the lastMessageAt timestamp on the conversation
    await db.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // 3. Publish the new message to the relevant Ably channel
    const channel = ably.channels.get(`private:chat:${conversationId}`);
    await channel.publish('message', newMessage); // Event name 'message'

    return newMessage as MessageResponse; // Cast to expected response type
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message.');
  }
}

/**
 * Server Action to mark messages as read by the current user.
 * @param conversationId The ID of the conversation.
 * @param messageIds An array of message IDs to mark as read.
 */
export async function markMessagesAsRead(
  conversationId: string,
  messageIds: string[]
) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new Error('Unauthorized');
  }
  const currentUserId = session.user.id;

  try {
    // Update messages in the database by pushing the current user's ID to `readBy`
    await db.message.updateMany({
      where: {
        id: { in: messageIds },
        // Ensure user hasn't already read it to prevent duplicate entries
        NOT: { readBy: { has: currentUserId } },
      },
      data: {
        readBy: {
          push: currentUserId,
        },
      },
    });

    // Optional: Send an Ably message to notify the other user about read status
    const channel = ably.channels.get(`private:chat:${conversationId}`);
    await channel.publish('read_receipt', {
      readerId: currentUserId,
      messageIds: messageIds,
      conversationId: conversationId,
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw new Error('Failed to mark messages as read.');
  }
}
