import { describe, expect, it } from 'bun:test';
import type { DiscountCartItem } from '@/services/checkout/discount-calculator';
import { calculateDiscount } from '@/services/checkout/discount-calculator';

const items: DiscountCartItem[] = [
  { productId: 'p1', price: 500, quantity: 2 },
  { productId: 'p2', price: 300, quantity: 1 },
];

describe('calculateDiscount', () => {
  describe('PERCENTAGE', () => {
    it('calculates percentage discount', () => {
      const result = calculateDiscount(
        {
          type: 'PERCENTAGE',
          value: 10,
          maxDiscount: null,
          tiers: [],
          bogoBuyQty: null,
          bogoFreeQty: null,
          scope: 'GLOBAL',
          scopeId: null,
        },
        items,
        1300,
        3,
      );
      expect(result.discountAmount).toBe(130);
      expect(result.cashbackAmount).toBe(0);
    });

    it('caps percentage discount at maxDiscount', () => {
      const result = calculateDiscount(
        {
          type: 'PERCENTAGE',
          value: 50,
          maxDiscount: 200,
          tiers: [],
          bogoBuyQty: null,
          bogoFreeQty: null,
          scope: 'GLOBAL',
          scopeId: null,
        },
        items,
        1300,
        3,
      );
      expect(result.discountAmount).toBe(200);
    });

    it('does not cap when maxDiscount is null', () => {
      const result = calculateDiscount(
        {
          type: 'PERCENTAGE',
          value: 50,
          maxDiscount: null,
          tiers: [],
          bogoBuyQty: null,
          bogoFreeQty: null,
          scope: 'GLOBAL',
          scopeId: null,
        },
        items,
        1300,
        3,
      );
      expect(result.discountAmount).toBe(650);
    });
  });

  describe('FIXED', () => {
    it('calculates fixed discount', () => {
      const result = calculateDiscount(
        {
          type: 'FIXED',
          value: 200,
          maxDiscount: null,
          tiers: [],
          bogoBuyQty: null,
          bogoFreeQty: null,
          scope: 'GLOBAL',
          scopeId: null,
        },
        items,
        1300,
        3,
      );
      expect(result.discountAmount).toBe(200);
    });

    it('caps fixed discount at subtotal', () => {
      const result = calculateDiscount(
        {
          type: 'FIXED',
          value: 5000,
          maxDiscount: null,
          tiers: [],
          bogoBuyQty: null,
          bogoFreeQty: null,
          scope: 'GLOBAL',
          scopeId: null,
        },
        items,
        1300,
        3,
      );
      expect(result.discountAmount).toBe(1300);
    });
  });

  describe('CASHBACK', () => {
    it('calculates cashback amount', () => {
      const result = calculateDiscount(
        {
          type: 'CASHBACK',
          value: 5,
          maxDiscount: null,
          tiers: [],
          bogoBuyQty: null,
          bogoFreeQty: null,
          scope: 'GLOBAL',
          scopeId: null,
        },
        items,
        1300,
        3,
      );
      expect(result.cashbackAmount).toBe(65);
      expect(result.discountAmount).toBe(0);
    });

    it('caps cashback at maxDiscount', () => {
      const result = calculateDiscount(
        {
          type: 'CASHBACK',
          value: 50,
          maxDiscount: 100,
          tiers: [],
          bogoBuyQty: null,
          bogoFreeQty: null,
          scope: 'GLOBAL',
          scopeId: null,
        },
        items,
        1300,
        3,
      );
      expect(result.cashbackAmount).toBe(100);
    });
  });

  describe('TIERS', () => {
    it('uses the highest matching tier', () => {
      const result = calculateDiscount(
        {
          type: 'PERCENTAGE',
          value: 10,
          maxDiscount: null,
          tiers: [
            { minQuantity: 1, value: 5, type: 'PERCENTAGE' },
            { minQuantity: 3, value: 10, type: 'PERCENTAGE' },
            { minQuantity: 5, value: 15, type: 'PERCENTAGE' },
          ],
          bogoBuyQty: null,
          bogoFreeQty: null,
          scope: 'GLOBAL',
          scopeId: null,
        },
        items,
        1300,
        3,
      );
      expect(result.discountAmount).toBe(130);
      expect(result.tierUsed).toEqual({
        minQuantity: 3,
        value: 10,
        type: 'PERCENTAGE',
      });
    });

    it('falls back to base coupon when no tier matches', () => {
      const result = calculateDiscount(
        {
          type: 'FIXED',
          value: 50,
          maxDiscount: null,
          tiers: [
            { minQuantity: 10, value: 200, type: 'FIXED' },
            { minQuantity: 20, value: 500, type: 'FIXED' },
          ],
          bogoBuyQty: null,
          bogoFreeQty: null,
          scope: 'GLOBAL',
          scopeId: null,
        },
        items,
        1300,
        3,
      );
      expect(result.discountAmount).toBe(50);
      expect(result.tierUsed).toBeNull();
    });
  });

  describe('BOGO', () => {
    it('applies BOGO discount', () => {
      const items: DiscountCartItem[] = [
        { productId: 'p1', price: 100, quantity: 3 },
      ];
      const result = calculateDiscount(
        {
          type: 'PERCENTAGE',
          value: 0,
          maxDiscount: null,
          tiers: [],
          bogoBuyQty: 2,
          bogoFreeQty: 1,
          scope: 'PRODUCT',
          scopeId: 'p1',
        },
        items,
        300,
        3,
      );
      expect(result.discountAmount).toBeGreaterThan(0);
      expect(result.bogoApplied).not.toBeNull();
      expect(result.bogoApplied?.freeItemPrice).toBe(100);
    });

    it('does not apply BOGO when quantity below threshold', () => {
      const items: DiscountCartItem[] = [
        { productId: 'p1', price: 100, quantity: 1 },
      ];
      const result = calculateDiscount(
        {
          type: 'PERCENTAGE',
          value: 0,
          maxDiscount: null,
          tiers: [],
          bogoBuyQty: 2,
          bogoFreeQty: 1,
          scope: 'PRODUCT',
          scopeId: 'p1',
        },
        items,
        100,
        1,
      );
      expect(result.bogoApplied).toBeNull();
    });
  });

  it('rounds to 2 decimal places', () => {
    const result = calculateDiscount(
      {
        type: 'PERCENTAGE',
        value: 33.33,
        maxDiscount: null,
        tiers: [],
        bogoBuyQty: null,
        bogoFreeQty: null,
        scope: 'GLOBAL',
        scopeId: null,
      },
      items,
      100,
      1,
    );
    expect(result.discountAmount).toBe(33.33);
  });
});
