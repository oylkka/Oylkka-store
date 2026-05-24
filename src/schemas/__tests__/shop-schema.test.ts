import { describe, expect, it } from 'bun:test';
import { ShopApiSchema } from '@/schemas/shop-schema';

describe('ShopApiSchema', () => {
  it('accepts valid shop data', () => {
    const result = ShopApiSchema.safeParse({
      name: 'My Shop',
      email: 'shop@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = ShopApiSchema.safeParse({
      name: '',
      email: 'shop@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short name', () => {
    const result = ShopApiSchema.safeParse({
      name: 'A',
      email: 'shop@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = ShopApiSchema.safeParse({
      name: 'My Shop',
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = ShopApiSchema.safeParse({ name: 'My Shop' });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const result = ShopApiSchema.safeParse({ email: 'shop@example.com' });
    expect(result.success).toBe(false);
  });

  it('accepts optional phone', () => {
    const result = ShopApiSchema.safeParse({
      name: 'My Shop',
      email: 'shop@example.com',
      phone: '+8801712345678',
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional address fields', () => {
    const result = ShopApiSchema.safeParse({
      name: 'My Shop',
      email: 'shop@example.com',
      addressLine1: '123 Main St',
      city: 'Dhaka',
      country: 'Bangladesh',
    });
    expect(result.success).toBe(true);
  });

  it('accepts all optional fields', () => {
    const result = ShopApiSchema.safeParse({
      name: 'My Shop',
      description: 'A great shop',
      email: 'shop@example.com',
      phone: '+8801712345678',
      website: 'https://myshop.com',
      addressLine1: '123 Main St',
      addressLine2: 'Suite 100',
      city: 'Dhaka',
      state: 'Dhaka',
      country: 'Bangladesh',
      postalCode: '1205',
    });
    expect(result.success).toBe(true);
  });
});
