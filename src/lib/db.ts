import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@/generated/prisma/client';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

declare global {
  var __prisma: PrismaClient | undefined;
  var __emailQueueTimer: ReturnType<typeof setInterval> | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Start the email queue background processor safely on the server
if (typeof window === 'undefined') {
  // Deferring execution by 0ms pushes this to the end of the event loop.
  // This gives Vite time to finish initializing all imported constants first.
  setTimeout(() => {
    if (!globalThis.__emailQueueTimer) {
      import('./email-queue').then(({ startEmailQueueProcessor }) => {
        // Double-check flag in case of rapid simultaneous module executions
        if (!globalThis.__emailQueueTimer) {
          globalThis.__emailQueueTimer = startEmailQueueProcessor();
        }
      });
    }
  }, 0);
}
