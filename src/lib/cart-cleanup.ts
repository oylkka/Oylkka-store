const CLEANUP_INTERVAL = 60 * 60 * 1000;

import { prisma } from '@/lib/db';
import { logError } from '@/lib/logger';

export async function cleanupExpiredCarts(): Promise<void> {
  try {
    const result = await prisma.cart.deleteMany({
      where: {
        expiresAt: {
          not: null,
          lte: new Date(),
        },
      },
    });
    if (result.count > 0) {
      // biome-ignore lint/suspicious/noConsole: intentional log
      console.log(`[Oylkka] Cleaned up ${result.count} expired cart(s)`);
    }
  } catch (err) {
    logError('cart-cleanup', err);
  }
}

export function startCartCleanupProcessor(): ReturnType<typeof setInterval> {
  cleanupExpiredCarts().catch((err) => logError('cart-cleanup', err));
  return setInterval(() => {
    cleanupExpiredCarts().catch((err) => logError('cart-cleanup', err));
  }, CLEANUP_INTERVAL);
}
