import { describe, expect, it } from 'bun:test';
import { ProductApiCreateSchema } from '@/schemas/product-api-schema';

const validProduct = {
  productName: 'Test Product',
  description: 'A valid description that is long enough',
  category: 'cat-1',
  slug: 'test-product',
  sku: 'TST-PRO001',
  price: 100,
  stock: 10,
};

describe('ProductApiCreateSchema', () => {
  it('accepts valid product data', () => {
    const result = ProductApiCreateSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('rejects empty product name', () => {
    const result = ProductApiCreateSchema.safeParse({
      ...validProduct,
      productName: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short product name', () => {
    const result = ProductApiCreateSchema.safeParse({
      ...validProduct,
      productName: 'A',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short description', () => {
    const result = ProductApiCreateSchema.safeParse({
      ...validProduct,
      description: 'Short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty category', () => {
    const result = ProductApiCreateSchema.safeParse({
      ...validProduct,
      category: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid slug format', () => {
    const result = ProductApiCreateSchema.safeParse({
      ...validProduct,
      slug: 'Invalid Slug!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = ProductApiCreateSchema.safeParse({
      ...validProduct,
      price: -10,
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero price', () => {
    const result = ProductApiCreateSchema.safeParse({
      ...validProduct,
      price: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative stock', () => {
    const result = ProductApiCreateSchema.safeParse({
      ...validProduct,
      stock: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer stock', () => {
    const result = ProductApiCreateSchema.safeParse({
      ...validProduct,
      stock: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional discountPrice', () => {
    const result = ProductApiCreateSchema.safeParse({
      ...validProduct,
      discountPrice: 80,
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional fields omitted', () => {
    const result = ProductApiCreateSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
      expect(result.data.condition).toBe('NEW');
      expect(result.data.hasVariants).toBe(false);
      expect(result.data.featured).toBe(false);
      expect(result.data.status).toBe('DRAFT');
      expect(result.data.weightUnit).toBe('kg');
    }
  });

  it('accepts valid variants', () => {
    const result = ProductApiCreateSchema.safeParse({
      ...validProduct,
      hasVariants: true,
      variants: [
        {
          name: 'Red',
          sku: 'TST-RED001',
          price: 110,
          stock: 5,
          attributes: { color: 'red' },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects variant with empty name', () => {
    const result = ProductApiCreateSchema.safeParse({
      ...validProduct,
      hasVariants: true,
      variants: [
        { name: '', sku: 'TST-RED001', price: 110, stock: 5, attributes: {} },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid dimensions', () => {
    const result = ProductApiCreateSchema.safeParse({
      ...validProduct,
      dimensions: { length: 10, width: 5, height: 3, unit: 'cm' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative dimension', () => {
    const result = ProductApiCreateSchema.safeParse({
      ...validProduct,
      dimensions: { length: -5, width: 5, height: 3, unit: 'cm' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects long brand name', () => {
    const result = ProductApiCreateSchema.safeParse({
      ...validProduct,
      brand: 'A'.repeat(41),
    });
    expect(result.success).toBe(false);
  });
});
