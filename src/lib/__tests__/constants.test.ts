import { describe, expect, it } from 'bun:test';
import { QUERY_KEYS } from '@/lib/constants';

describe('QUERY_KEYS', () => {
  it('has all expected keys', () => {
    expect(QUERY_KEYS.HERO_BANNER).toBe('hero-banner');
    expect(QUERY_KEYS.CATEGORIES).toBe('categories');
    expect(QUERY_KEYS.CART).toBe('cart');
    expect(QUERY_KEYS.ORDERS).toBe('orders');
    expect(QUERY_KEYS.WALLET).toBe('wallet');
    expect(QUERY_KEYS.WISHLIST).toBe('wishlist');
    expect(QUERY_KEYS.CONVERSATIONS).toBe('conversations');
    expect(QUERY_KEYS.PRODUCTS).toBe('products');
  });

  it('has all string values', () => {
    for (const value of Object.values(QUERY_KEYS)) {
      expect(typeof value).toBe('string');
    }
  });

  it('has at least the expected keys', () => {
    expect(Object.keys(QUERY_KEYS).length).toBeGreaterThanOrEqual(22);
  });
});
