import { describe, expect, it } from 'bun:test';
import {
  applyShippingDiscounts,
  sumVoucherTotals,
} from '@/services/checkout/voucher-processor';

describe('applyShippingDiscounts', () => {
  const voucher = (
    overrides: Partial<{
      shippingDiscount: number;
      freeShipping: boolean;
    }>,
  ) => ({
    id: 'v1',
    couponId: 'c1',
    code: 'TEST',
    discountAmount: 0,
    shippingDiscount: 0,
    freeShipping: false,
    cashbackAmount: 0,
    scope: 'GLOBAL',
    scopeId: null,
    tierUsed: null,
    bogoApplied: null,
    ...overrides,
  });

  it('returns base shipping when no vouchers', () => {
    expect(applyShippingDiscounts([], 100)).toBe(100);
  });

  it('applies free shipping', () => {
    expect(applyShippingDiscounts([voucher({ freeShipping: true })], 100)).toBe(
      0,
    );
  });

  it('applies shipping discount', () => {
    expect(
      applyShippingDiscounts([voucher({ shippingDiscount: 30 })], 100),
    ).toBe(70);
  });

  it('does not go below zero with shipping discount', () => {
    expect(
      applyShippingDiscounts([voucher({ shippingDiscount: 200 })], 100),
    ).toBe(0);
  });

  it('free shipping takes priority over discount', () => {
    expect(
      applyShippingDiscounts(
        [
          voucher({ freeShipping: true, shippingDiscount: 30 }),
          voucher({ shippingDiscount: 20 }),
        ],
        100,
      ),
    ).toBe(0);
  });

  it('stacks multiple shipping discounts', () => {
    expect(
      applyShippingDiscounts(
        [voucher({ shippingDiscount: 30 }), voucher({ shippingDiscount: 20 })],
        100,
      ),
    ).toBe(50);
  });
});

describe('sumVoucherTotals', () => {
  const voucher = (
    overrides: Partial<{
      discountAmount: number;
      cashbackAmount: number;
    }>,
  ) => ({
    id: 'v1',
    couponId: 'c1',
    code: 'TEST',
    discountAmount: 0,
    shippingDiscount: 0,
    freeShipping: false,
    cashbackAmount: 0,
    scope: 'GLOBAL',
    scopeId: null,
    tierUsed: null,
    bogoApplied: null,
    ...overrides,
  });

  it('sums zero for empty vouchers', () => {
    expect(sumVoucherTotals([])).toEqual({
      totalCouponDiscount: 0,
      totalCashback: 0,
    });
  });

  it('sums discount and cashback', () => {
    expect(
      sumVoucherTotals([
        voucher({ discountAmount: 100, cashbackAmount: 20 }),
        voucher({ discountAmount: 50, cashbackAmount: 10 }),
      ]),
    ).toEqual({
      totalCouponDiscount: 150,
      totalCashback: 30,
    });
  });

  it('handles single voucher', () => {
    expect(
      sumVoucherTotals([voucher({ discountAmount: 200, cashbackAmount: 0 })]),
    ).toEqual({
      totalCouponDiscount: 200,
      totalCashback: 0,
    });
  });
});
