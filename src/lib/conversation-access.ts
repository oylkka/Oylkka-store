import { prisma } from '@/lib/db';
import type {
  ConversationParticipant,
  ConversationStatus,
} from '@/types/messaging';

export type ConversationAccess = {
  conversationId: string;
  customerId: string;
  vendorId: string;
  shopId: string;
  status: ConversationStatus;
  participant: ConversationParticipant;
  otherUserId: string;
};

type ConversationAccessResult =
  | { access: ConversationAccess; response: null }
  | { access: null; response: Response };

/**
 * Resolves the current user's relationship to a conversation. This is the
 * single authorization check shared by every customer/vendor messaging route.
 * Staff access is intentionally not granted here; existing admin endpoints
 * remain separate.
 */
export async function getConversationAccess(
  conversationId: string,
  userId: string,
): Promise<ConversationAccessResult> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      customerId: true,
      shopId: true,
      status: true,
      shop: { select: { ownerId: true } },
    },
  });

  if (!conversation) {
    return {
      access: null,
      response: Response.json(
        { error: 'Conversation not found' },
        { status: 404 },
      ),
    };
  }

  const isCustomer = conversation.customerId === userId;
  const isVendor = conversation.shop.ownerId === userId;

  if (!isCustomer && !isVendor) {
    return {
      access: null,
      response: Response.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  const participant: ConversationParticipant = isCustomer
    ? 'customer'
    : 'vendor';

  return {
    access: {
      conversationId: conversation.id,
      customerId: conversation.customerId,
      vendorId: conversation.shop.ownerId,
      shopId: conversation.shopId,
      status: conversation.status,
      participant,
      otherUserId: isCustomer
        ? conversation.shop.ownerId
        : conversation.customerId,
    },
    response: null,
  };
}
