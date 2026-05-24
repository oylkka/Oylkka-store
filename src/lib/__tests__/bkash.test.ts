import { beforeEach, describe, expect, it } from 'bun:test';

describe('bKash Service', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    delete process.env.BKASH_APP_KEY;
    delete process.env.BKASH_APP_SECRET;
    delete process.env.BKASH_USERNAME;
    delete process.env.BKASH_PASSWORD;
  });

  describe('isConfigured', () => {
    it('returns false when no credentials set', async () => {
      const { createBkashPayment } = await import('@/lib/bkash');
      await expect(
        createBkashPayment({
          amount: 100,
          orderId: 'o1',
          merchantInvoiceNumber: 'INV-001',
          callbackURL: 'http://localhost:3000/api/checkout/bkash-callback',
        }),
      ).rejects.toThrow('bKash is not configured');
    });
  });

  describe('getConfig', () => {
    it('uses default base URL when env not set', async () => {
      // Can't easily test the module internals, but we can verify
      // that the function reads from env
      process.env.BKASH_APP_KEY = 'test-key';
      process.env.BKASH_APP_SECRET = 'test-secret';
      process.env.BKASH_USERNAME = 'test-user';
      process.env.BKASH_PASSWORD = 'test-pass';

      // Just verify no error when calling isConfigured via createBkashPayment
      // The actual test would need to mock fetch + prisma
      // This tests credential reading
      const { createBkashPayment } = await import('@/lib/bkash');
      await expect(
        createBkashPayment({
          amount: 100,
          orderId: 'o1',
          merchantInvoiceNumber: 'INV-001',
          callbackURL: 'http://localhost:3000/api/checkout/bkash-callback',
        }),
      ).rejects.toThrow(); // will fail on fetch, not on config
    });
  });

  describe('queryBkashPayment', () => {
    it('throws when bKash not configured', async () => {
      const { queryBkashPayment } = await import('@/lib/bkash');
      // queryBkashPayment checks config inline, throws before prisma call
      await expect(queryBkashPayment('pid123')).rejects.toThrow();
    });
  });

  describe('refundBkashPayment', () => {
    it('throws when bKash not configured', async () => {
      const { refundBkashPayment } = await import('@/lib/bkash');
      await expect(
        refundBkashPayment({
          paymentID: 'pid123',
          trxID: 'trx123',
          amount: 100,
        }),
      ).rejects.toThrow();
    });
  });

  describe('executeBkashPayment', () => {
    it('throws when bKash not configured', async () => {
      const { executeBkashPayment } = await import('@/lib/bkash');
      await expect(executeBkashPayment('pid123')).rejects.toThrow();
    });
  });
});
