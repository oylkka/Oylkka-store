import { Rest, type TokenRequest } from 'ably';
import { logError } from '@/lib/logger';
import type { MessageCreatedEvent } from '@/types/messaging';

let client: Rest | null = null;
let clientKey: string | null = null;

export function getUserChannelName(userId: string): string {
  return `user:${userId}`;
}

function getAblyRest(): Rest | null {
  const apiKey = process.env.ABLY_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  if (!client || clientKey !== apiKey) {
    client = new Rest({ key: apiKey });
    clientKey = apiKey;
  }

  return client;
}

/**
 * Creates a short-lived, subscribe-only Ably token request for one user.
 * Returns null when Ably is not configured so callers can return a clear 503.
 */
export async function createUserTokenRequest(
  userId: string,
): Promise<TokenRequest | null> {
  const rest = getAblyRest();
  if (!rest) {
    return null;
  }

  return rest.auth.createTokenRequest({
    clientId: userId,
    capability: { [getUserChannelName(userId)]: ['subscribe'] },
    ttl: 60 * 60 * 1000,
  });
}

/**
 * Publishes a message event to each participant's user channel. Delivery is
 * best-effort: a publish failure must never fail the database write that
 * already committed, so failures are logged and swallowed.
 */
export async function publishMessageCreated(
  recipientIds: string[],
  event: MessageCreatedEvent,
): Promise<void> {
  try {
    const rest = getAblyRest();
    if (!rest) {
      return;
    }

    const channels = [...new Set(recipientIds)].map(getUserChannelName);
    const results = await Promise.allSettled(
      channels.map((channel) =>
        rest.channels.get(channel).publish('message.created', event),
      ),
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        logError('ably-publish-message-created', result.reason);
      }
    }
  } catch (error) {
    logError('ably-publish-message-created', error);
  }
}
