import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/db';
import type {
  ConversationContext,
  ConversationListItem,
  ConversationParticipant,
  MessageSummary,
  MessageView,
} from '@/types/messaging';

export const conversationContextSelect = {
  id: true,
  customerId: true,
  subject: true,
  status: true,
  lastMessageAt: true,
  createdAt: true,
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
    },
  },
  shop: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
    },
  },
  order: {
    select: {
      id: true,
      orderNumber: true,
    },
  },
  product: {
    select: {
      id: true,
      slug: true,
      productName: true,
      images: {
        take: 1,
        orderBy: { order: 'asc' },
        select: { imageUrl: true },
      },
    },
  },
} satisfies Prisma.ConversationSelect;

type ConversationContextRow = Prisma.ConversationGetPayload<{
  select: typeof conversationContextSelect;
}>;

export function toConversationContext(
  conversation: ConversationContextRow,
  viewerRole: ConversationParticipant,
): ConversationContext {
  const counterpart: ConversationContext['counterpart'] =
    viewerRole === 'customer'
      ? {
          kind: 'shop',
          id: conversation.shop.id,
          name: conversation.shop.name,
          slug: conversation.shop.slug,
          imageUrl: conversation.shop.logoUrl,
        }
      : {
          kind: 'customer',
          id: conversation.customer.id,
          name: conversation.customer.name,
          email: conversation.customer.email,
          imageUrl: conversation.customer.imageUrl || null,
        };

  return {
    id: conversation.id,
    subject: conversation.subject,
    status: conversation.status,
    lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
    createdAt: conversation.createdAt.toISOString(),
    viewerRole,
    counterpart,
    shop: {
      id: conversation.shop.id,
      name: conversation.shop.name,
      slug: conversation.shop.slug,
      logoUrl: conversation.shop.logoUrl,
    },
    order: conversation.order
      ? {
          id: conversation.order.id,
          orderNumber: conversation.order.orderNumber,
        }
      : null,
    product: conversation.product
      ? {
          id: conversation.product.id,
          slug: conversation.product.slug,
          productName: conversation.product.productName,
          imageUrl: conversation.product.images[0]?.imageUrl ?? null,
        }
      : null,
  };
}

export const messageSummarySelect = {
  id: true,
  senderId: true,
  content: true,
  imageUrl: true,
  createdAt: true,
  isRead: true,
} satisfies Prisma.MessageSelect;

type MessageSummaryRow = Prisma.MessageGetPayload<{
  select: typeof messageSummarySelect;
}>;

export function toMessageSummary(message: MessageSummaryRow): MessageSummary {
  return {
    id: message.id,
    senderId: message.senderId,
    content: message.content,
    imageUrl: message.imageUrl,
    createdAt: message.createdAt.toISOString(),
    isRead: message.isRead,
  };
}

export const messageViewSelect = {
  ...messageSummarySelect,
  conversationId: true,
  sender: {
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  },
} satisfies Prisma.MessageSelect;

type MessageViewRow = Prisma.MessageGetPayload<{
  select: typeof messageViewSelect;
}>;

export function toMessageView(message: MessageViewRow): MessageView {
  return {
    ...toMessageSummary(message),
    conversationId: message.conversationId,
    sender: {
      id: message.sender.id,
      name: message.sender.name,
      imageUrl: message.sender.imageUrl || null,
    },
  };
}

/**
 * Total unread badge count for a participant. A message counts only when the
 * other party sent it; the viewer's own messages can never look unread.
 */
export async function countUnreadMessages(userId: string): Promise<number> {
  return prisma.message.count({
    where: {
      senderId: { not: userId },
      isRead: false,
      conversation: {
        OR: [{ customerId: userId }, { shop: { ownerId: userId } }],
      },
    },
  });
}

export type ConversationListRow = ConversationContextRow & {
  lastMessage: MessageSummaryRow | null;
  messageCount: number;
};

export function toConversationListItem(
  row: ConversationListRow,
  viewerRole: ConversationParticipant,
): ConversationListItem {
  return {
    ...toConversationContext(row, viewerRole),
    lastMessage: row.lastMessage ? toMessageSummary(row.lastMessage) : null,
    messageCount: row.messageCount,
  };
}
