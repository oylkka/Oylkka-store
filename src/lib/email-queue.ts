import { prisma } from '@/lib/db';
import transporter from '@/lib/nodemailer';

const BATCH_SIZE = 10;
const POLL_INTERVAL = 30_000;

export async function queueEmail(
  to: string,
  subject: string,
  html: string,
): Promise<string> {
  const entry = await prisma.emailQueue.create({
    data: { to, subject, html },
  });

  processEmailQueue().catch(() => {});

  return entry.id;
}

export async function processEmailQueue(): Promise<void> {
  try {
    const pending = await prisma.emailQueue.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: BATCH_SIZE,
    });

    if (pending.length === 0) return;

    for (const email of pending) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_SENDER,
          to: email.to,
          subject: `Oylkka - ${email.subject}`,
          html: email.html,
        });

        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { status: 'SENT', sentAt: new Date() },
        });
      } catch (err) {
        const newRetryCount = email.retryCount + 1;
        const newStatus =
          newRetryCount >= email.maxRetries ? 'FAILED' : 'PENDING';

        await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            status: newStatus,
            retryCount: newRetryCount,
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        });
      }
    }
  } catch {
    // Queue processing errors should never crash the server
  }
}

export function startEmailQueueProcessor(): ReturnType<typeof setInterval> {
  processEmailQueue().catch(() => {});
  return setInterval(() => {
    processEmailQueue().catch(() => {});
  }, POLL_INTERVAL);
}
