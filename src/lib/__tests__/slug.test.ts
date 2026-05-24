import { describe, expect, it } from 'bun:test';
import { slugify } from '@/lib/slug';

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('hello world test')).toBe('hello-world-test');
  });

  it('replaces multiple spaces with single hyphen', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('replaces underscores with hyphens', () => {
    expect(slugify('hello_world')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('hello!@#$% world')).toBe('hello-world');
  });

  it('removes leading hyphens', () => {
    expect(slugify('--hello-world')).toBe('hello-world');
  });

  it('removes trailing hyphens', () => {
    expect(slugify('hello-world--')).toBe('hello-world');
  });

  it('collapses consecutive hyphens', () => {
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('trims whitespace', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles single word', () => {
    expect(slugify('Hello')).toBe('hello');
  });

  it('handles numbers', () => {
    expect(slugify('Product 123')).toBe('product-123');
  });

  it('handles unicode characters (removes them)', () => {
    expect(slugify('café')).toBe('caf');
  });
});
