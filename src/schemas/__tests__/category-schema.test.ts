import { describe, expect, it } from 'bun:test';
import { CategoryApiSchema } from '@/schemas/category-schema';

describe('CategoryApiSchema', () => {
  it('accepts valid category with just name', () => {
    const result = CategoryApiSchema.safeParse({ name: 'Electronics' });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = CategoryApiSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects short name', () => {
    const result = CategoryApiSchema.safeParse({ name: 'A' });
    expect(result.success).toBe(false);
  });

  it('accepts optional description', () => {
    const result = CategoryApiSchema.safeParse({
      name: 'Electronics',
      description: 'Electronic items',
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional parentId', () => {
    const result = CategoryApiSchema.safeParse({
      name: 'Laptops',
      parentId: 'cat-1',
    });
    expect(result.success).toBe(true);
  });

  it('accepts featured flag', () => {
    const result = CategoryApiSchema.safeParse({
      name: 'Featured Category',
      featured: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.featured).toBe(true);
    }
  });

  it('defaults featured to false', () => {
    const result = CategoryApiSchema.safeParse({ name: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.featured).toBe(false);
    }
  });

  it('accepts order value', () => {
    const result = CategoryApiSchema.safeParse({ name: 'Test', order: 5 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.order).toBe(5);
    }
  });

  it('defaults order to 0', () => {
    const result = CategoryApiSchema.safeParse({ name: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.order).toBe(0);
    }
  });

  it('rejects negative order', () => {
    const result = CategoryApiSchema.safeParse({ name: 'Test', order: -1 });
    expect(result.success).toBe(false);
  });

  it('coerces string order to number', () => {
    const result = CategoryApiSchema.safeParse({ name: 'Test', order: '3' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.order).toBe(3);
    }
  });
});
