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

// Start the email queue background processor on the server
if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
  import('./email-queue').then(({ startEmailQueueProcessor }) => {
    if (!globalThis.__emailQueueTimer) {
      globalThis.__emailQueueTimer = startEmailQueueProcessor();
    }
  });
}
