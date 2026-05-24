import { describe, expect, it } from 'bun:test';
import type {
  CouponValidationContext,
  CouponValidationInput,
} from '@/services/checkout/coupon-validator';
import { checkCouponEligibility } from '@/services/checkout/coupon-validator';

const validCoupon: CouponValidationInput = {
  isActive: true,
  expiresAt: null,
  startsAt: null,
  maxUses: 0,
  usedCount: 0,
  maxClaimCount: 0,
  claimedCount: 0,
  firstOrderOnly: false,
  repeatPurchaseOnly: false,
  requiredPaymentMethod: null,
  platformRestriction: 'ALL',
  minQuantity: null,
  minOrderAmount: null,
  scope: 'GLOBAL',
  scopeId: null,
};

const defaultCtx: CouponValidationContext = {
  now: new Date('2025-06-01'),
  subtotal: 1000,
  totalQty: 3,
  cartItems: [
    { productId: 'p1', quantity: 2 },
    { productId: 'p2', quantity: 1 },
  ],
  paymentMethod: 'BKASH',
  userAgent: 'Mozilla/5.0',
  customerOrderCount: 2,
};

describe('checkCouponEligibility', () => {
  it('returns null for valid coupon', () => {
    expect(checkCouponEligibility(validCoupon, defaultCtx)).toBeNull();
  });

  it('rejects inactive coupon', () => {
    expect(
      checkCouponEligibility({ ...validCoupon, isActive: false }, defaultCtx),
    ).toBe('This coupon is no longer active');
  });

  it('rejects expired coupon', () => {
    expect(
      checkCouponEligibility(
        {
          ...validCoupon,
          expiresAt: new Date('2025-01-01'),
        },
        defaultCtx,
      ),
    ).toBe('This coupon has expired');
  });

  it('rejects not-yet-valid coupon', () => {
    expect(
      checkCouponEligibility(
        {
          ...validCoupon,
          startsAt: new Date('2025-12-01'),
        },
        defaultCtx,
      ),
    ).toBe('This coupon is not yet valid');
  });

  it('rejects coupon at usage limit', () => {
    expect(
      checkCouponEligibility(
        { ...validCoupon, maxUses: 100, usedCount: 100 },
        defaultCtx,
      ),
    ).toBe('This coupon has reached its usage limit');
  });

  it('rejects fully claimed voucher', () => {
    expect(
      checkCouponEligibility(
        { ...validCoupon, maxClaimCount: 50, claimedCount: 50 },
        defaultCtx,
      ),
    ).toBe('This voucher is no longer available (all claimed)');
  });

  it('rejects firstOrderOnly for returning customers', () => {
    expect(
      checkCouponEligibility(
        { ...validCoupon, firstOrderOnly: true },
        defaultCtx,
      ),
    ).toBe('This coupon is for first-time buyers only');
  });

  it('accepts firstOrderOnly for first-time customers', () => {
    expect(
      checkCouponEligibility(
        { ...validCoupon, firstOrderOnly: true },
        { ...defaultCtx, customerOrderCount: 0 },
      ),
    ).toBeNull();
  });

  it('rejects repeatPurchaseOnly for first-time customers', () => {
    expect(
      checkCouponEligibility(
        { ...validCoupon, repeatPurchaseOnly: true },
        { ...defaultCtx, customerOrderCount: 0 },
      ),
    ).toBe('This coupon is for repeat customers only');
  });

  it('accepts repeatPurchaseOnly for returning customers', () => {
    expect(
      checkCouponEligibility(
        { ...validCoupon, repeatPurchaseOnly: true },
        { ...defaultCtx, customerOrderCount: 5 },
      ),
    ).toBeNull();
  });

  it('rejects mismatched payment method', () => {
    expect(
      checkCouponEligibility(
        { ...validCoupon, requiredPaymentMethod: 'COD' },
        defaultCtx,
      ),
    ).toBe('This coupon requires COD payment');
  });

  it('accepts matching payment method', () => {
    expect(
      checkCouponEligibility(
        { ...validCoupon, requiredPaymentMethod: 'BKASH' },
        defaultCtx,
      ),
    ).toBeNull();
  });

  it('rejects mobile-only coupon on web', () => {
    expect(
      checkCouponEligibility(
        { ...validCoupon, platformRestriction: 'MOBILE_ONLY' },
        defaultCtx,
      ),
    ).toBe('This coupon is available on mobile app only');
  });

  it('accepts mobile-only coupon from mobile user agent', () => {
    expect(
      checkCouponEligibility(
        { ...validCoupon, platformRestriction: 'MOBILE_ONLY' },
        { ...defaultCtx, userAgent: 'Mozilla/5.0 (Android 13)' },
      ),
    ).toBeNull();
  });

  it('rejects web-only coupon on mobile', () => {
    expect(
      checkCouponEligibility(
        { ...validCoupon, platformRestriction: 'WEB_ONLY' },
        { ...defaultCtx, userAgent: 'Mozilla/5.0 (iPhone)' },
      ),
    ).toBe('This coupon is available on web only');
  });

  it('rejects insufficient quantity for product-scoped coupon', () => {
    expect(
      checkCouponEligibility(
        {
          ...validCoupon,
          minQuantity: 5,
          scope: 'PRODUCT',
          scopeId: 'p1',
        },
        defaultCtx,
      ),
    ).toBe('Need 5 of this product (2 in cart)');
  });

  it('accepts sufficient quantity for product-scoped coupon', () => {
    expect(
      checkCouponEligibility(
        {
          ...validCoupon,
          minQuantity: 2,
          scope: 'PRODUCT',
          scopeId: 'p1',
        },
        defaultCtx,
      ),
    ).toBeNull();
  });

  it('rejects insufficient total quantity', () => {
    expect(
      checkCouponEligibility({ ...validCoupon, minQuantity: 10 }, defaultCtx),
    ).toBe('Minimum 10 items required (3 in cart)');
  });

  it('rejects insufficient order amount', () => {
    expect(
      checkCouponEligibility(
        { ...validCoupon, minOrderAmount: 2000 },
        defaultCtx,
      ),
    ).toBe('Minimum order amount is ৳2,000');
  });

  it('accepts sufficient order amount', () => {
    expect(
      checkCouponEligibility(
        { ...validCoupon, minOrderAmount: 500 },
        defaultCtx,
      ),
    ).toBeNull();
  });
});
