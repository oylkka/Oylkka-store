const BATCH_SIZE = 10;
const POLL_INTERVAL = 30_000;

import { prisma } from '@/lib/db';
import { generateInvoicePdf } from '@/lib/invoice-pdf';
import { logError } from '@/lib/logger';

export async function enqueueInvoiceGeneration(
  orderId: string,
): Promise<string> {
  const entry = await prisma.invoiceQueue.create({
    data: { orderId },
  });
  processInvoiceQueue().catch((err) => logError('invoice-queue', err));

  return entry.id;
}

export async function processInvoiceQueue(): Promise<void> {
  try {
    const pending = await prisma.invoiceQueue.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: BATCH_SIZE,
    });

    if (pending.length === 0) return;

    for (const job of pending) {
      try {
        await prisma.invoiceQueue.update({
          where: { id: job.id },
          data: { status: 'PROCESSING' },
        });

        const pdfUrl = await generateInvoicePdf(job.orderId);

        await prisma.invoiceQueue.update({
          where: { id: job.id },
          data: {
            status: pdfUrl ? 'COMPLETED' : 'FAILED',
            processedAt: new Date(),
            error: pdfUrl ? null : 'Invoice generation returned no URL',
          },
        });
      } catch (err) {
        const newRetryCount = job.retryCount + 1;
        const newStatus =
          newRetryCount >= job.maxRetries ? 'FAILED' : 'PENDING';

        await prisma.invoiceQueue.update({
          where: { id: job.id },
          data: {
            status: newStatus,
            retryCount: newRetryCount,
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        });
      }
    }
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: this is fine
    console.error('Failed to process invoice queue item:', error);
  }
}

export function startInvoiceQueueProcessor(): ReturnType<typeof setInterval> {
  processInvoiceQueue().catch((err) => logError('invoice-queue', err));
  return setInterval(() => {
    processInvoiceQueue().catch((err) => logError('invoice-queue', err));
  }, POLL_INTERVAL);
}
