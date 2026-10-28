import type { ClientOptions, Realtime } from 'ably';

export type RealtimeClient = Realtime;

/**
 * Loads the browser Ably SDK only when a realtime connection is requested.
 * Keeping the SDK import here prevents it from entering the server render path
 * and gives tests a single seam to replace the network client.
 */
export async function createRealtimeClient(
  options: ClientOptions,
): Promise<RealtimeClient> {
  const { Realtime } = await import('ably');
  return new Realtime(options);
}
