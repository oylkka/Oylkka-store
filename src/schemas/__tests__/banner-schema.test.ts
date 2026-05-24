import { describe, expect, it } from 'bun:test';
import { BannerApiSchema } from '@/schemas/banner-schema';

const validBanner = {
  title: 'Summer Sale',
  alignment: 'CENTER' as const,
  bannerPosition: 'HOME_TOP' as const,
};

describe('BannerApiSchema', () => {
  it('accepts valid banner data', () => {
    const result = BannerApiSchema.safeParse(validBanner);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = BannerApiSchema.safeParse({ ...validBanner, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid alignment', () => {
    const result = BannerApiSchema.safeParse({
      ...validBanner,
      alignment: 'INVALID',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid bannerPosition', () => {
    const result = BannerApiSchema.safeParse({
      ...validBanner,
      bannerPosition: 'INVALID',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing alignment', () => {
    const { alignment: _, ...noAlignment } = validBanner;
    const result = BannerApiSchema.safeParse(noAlignment);
    expect(result.success).toBe(false);
  });

  it('rejects missing bannerPosition', () => {
    const { bannerPosition: _, ...noPosition } = validBanner;
    const result = BannerApiSchema.safeParse(noPosition);
    expect(result.success).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = BannerApiSchema.safeParse({
      ...validBanner,
      subtitle: 'Big discounts',
      description: 'Up to 50% off',
      bannerTag: 'PROMO',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid URL for primaryActionLink', () => {
    const result = BannerApiSchema.safeParse({
      ...validBanner,
      primaryActionText: 'Shop Now',
      primaryActionLink: 'invalid-url',
    });
    expect(result.success).toBe(false);
  });

  it('accepts http URL for primaryActionLink', () => {
    const result = BannerApiSchema.safeParse({
      ...validBanner,
      primaryActionText: 'Shop Now',
      primaryActionLink: 'https://example.com',
    });
    expect(result.success).toBe(true);
  });

  it('requires primaryActionLink when primaryActionText provided', () => {
    const result = BannerApiSchema.safeParse({
      ...validBanner,
      primaryActionText: 'Shop Now',
    });
    expect(result.success).toBe(false);
  });

  it('allows primaryActionText without link when omitted', () => {
    const result = BannerApiSchema.safeParse(validBanner);
    expect(result.success).toBe(true);
  });

  it('rejects endDate before startDate', () => {
    const result = BannerApiSchema.safeParse({
      ...validBanner,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-05-01'),
    });
    expect(result.success).toBe(false);
  });

  it('accepts endDate after startDate', () => {
    const result = BannerApiSchema.safeParse({
      ...validBanner,
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-06-01'),
    });
    expect(result.success).toBe(true);
  });

  it('accepts endDate without startDate', () => {
    const result = BannerApiSchema.safeParse({
      ...validBanner,
      endDate: new Date('2025-06-01'),
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing secondaryActionLink when secondaryActionText provided', () => {
    const result = BannerApiSchema.safeParse({
      ...validBanner,
      secondaryActionText: 'Learn More',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid secondary link', () => {
    const result = BannerApiSchema.safeParse({
      ...validBanner,
      secondaryActionText: 'Learn More',
      secondaryActionLink: 'https://example.com',
    });
    expect(result.success).toBe(true);
  });
});
