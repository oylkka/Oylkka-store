import { describe, expect, it, spyOn } from 'bun:test';
import apiClient from '@/lib/api-client';

const mockVoucher = {
  id: 'v1',
  code: 'SUMMER20',
  title: 'Summer Sale',
  description: 'Save 20%',
  discountType: 'PERCENTAGE',
  discountValue: 20,
  minOrderAmount: null,
  minQuantity: null,
  maxUses: null,
  claimedCount: 0,
  maxClaimCount: 100,
  expiresAt: null,
  scope: 'GLOBAL',
  scopeId: null,
  autoApply: false,
  freeShipping: false,
  shippingDiscount: 0,
};

const mockUserVoucher = {
  id: 'uv1',
  couponId: 'v1',
  collectedAt: '2025-01-01T00:00:00Z',
  usedAt: null,
  coupon: mockVoucher,
};

describe('voucher service API calls', () => {
  it('fetches my vouchers', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: [mockUserVoucher],
    });

    const response = await apiClient.get('/api/vouchers/my');
    expect(get).toHaveBeenCalledWith('/api/vouchers/my');
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('collects a voucher', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Voucher collected!' },
    });

    const response = await apiClient.post('/api/vouchers/collect', {
      couponId: 'v1',
    });
    expect(post).toHaveBeenCalledWith('/api/vouchers/collect', {
      couponId: 'v1',
    });
    expect(response.data.message).toBe('Voucher collected!');
  });

  it('fetches auto-apply vouchers', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: [mockVoucher],
    });

    const response = await apiClient.get('/api/vouchers/auto-apply');
    expect(get).toHaveBeenCalledWith('/api/vouchers/auto-apply');
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('fetches product vouchers', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: [mockVoucher],
    });

    await apiClient.get('/api/vouchers/product', {
      params: { productId: 'p1' },
    });
    expect(get).toHaveBeenCalledWith('/api/vouchers/product', {
      params: { productId: 'p1' },
    });
  });
});
