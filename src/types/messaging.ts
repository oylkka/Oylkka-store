export const SUBJECT_MAX_LENGTH = 200;
export const MESSAGE_MAX_LENGTH = 2000;

export type ConversationStatus = 'OPEN' | 'CLOSED';
export type ConversationParticipant = 'customer' | 'vendor';

export type MessageSummary = {
  id: string;
  senderId: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  isRead: boolean;
};

export type MessageView = MessageSummary & {
  conversationId: string;
  sender: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
};

export type ConversationCounterpart =
  | {
      kind: 'shop';
      id: string;
      name: string;
      slug: string;
      imageUrl: string | null;
    }
  | {
      kind: 'customer';
      id: string;
      name: string;
      email: string;
      imageUrl: string | null;
    };

export type ConversationContext = {
  id: string;
  subject: string;
  status: ConversationStatus;
  lastMessageAt: string | null;
  createdAt: string;
  viewerRole: ConversationParticipant;
  counterpart: ConversationCounterpart;
  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  order: {
    id: string;
    orderNumber: string;
  } | null;
  product: {
    id: string;
    slug: string;
    productName: string;
    imageUrl: string | null;
  } | null;
};

export type ConversationListItem = ConversationContext & {
  lastMessage: MessageSummary | null;
  messageCount: number;
};

export type MessageCreatedEvent = {
  type: 'message.created';
  conversationId: string;
  message: MessageSummary;
};
