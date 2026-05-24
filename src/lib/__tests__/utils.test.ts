import { describe, expect, it } from 'bun:test';
import { cleanFormData, getInitials } from '@/lib/utils';

describe('cleanFormData', () => {
  it('removes undefined values', () => {
    expect(cleanFormData({ a: 1, b: undefined })).toEqual({ a: 1 });
  });

  it('removes null values', () => {
    expect(cleanFormData({ a: 1, b: null })).toEqual({ a: 1 });
  });

  it('removes empty string values', () => {
    expect(cleanFormData({ a: 'hello', b: '' })).toEqual({ a: 'hello' });
  });

  it('preserves zero', () => {
    expect(cleanFormData({ a: 0, b: false })).toEqual({ a: 0, b: false });
  });

  it('preserves falsy but meaningful values', () => {
    expect(cleanFormData({ a: false, b: 0, c: '' })).toEqual({
      a: false,
      b: 0,
    });
  });

  it('returns empty object for all-empty input', () => {
    expect(cleanFormData({ a: undefined, b: null, c: '' })).toEqual({});
  });

  it('handles empty object', () => {
    expect(cleanFormData({})).toEqual({});
  });

  it('preserves string values', () => {
    expect(cleanFormData({ name: 'test', desc: 'hello' })).toEqual({
      name: 'test',
      desc: 'hello',
    });
  });
});

describe('getInitials', () => {
  it('returns empty string for null', () => {
    expect(getInitials(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(getInitials(undefined)).toBe('');
  });

  it('returns empty string for empty name', () => {
    expect(getInitials('')).toBe('');
  });

  it('handles single word name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('handles two word name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('handles multiple word name', () => {
    expect(getInitials('John Michael Doe')).toBe('JD');
  });

  it('handles extra whitespace', () => {
    expect(getInitials('  john   doe  ')).toBe('JD');
  });

  it('handles lowercase input', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});
