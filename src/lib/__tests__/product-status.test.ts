import { describe, expect, it } from 'bun:test';
import { productStatusBadge } from '@/lib/product-status';

describe('productStatusBadge', () => {
  it('labels every status the ProductStatus enum can hold', () => {
    expect(productStatusBadge('PUBLISHED')).toEqual({
      variant: 'default',
      label: 'Published',
    });
    expect(productStatusBadge('DRAFT')).toEqual({
      variant: 'secondary',
      label: 'Draft',
    });
    expect(productStatusBadge('ARCHIVED')).toEqual({
      variant: 'outline',
      label: 'Archived',
    });
    expect(productStatusBadge('OUT_OF_STOCK')).toEqual({
      variant: 'destructive',
      label: 'Out of Stock',
    });
  });

  it('shows a rejection as a rejection', () => {
    expect(productStatusBadge('REJECTED')).toEqual({
      variant: 'destructive',
      label: 'Rejected',
    });
  });

  it('treats the legacy ACTIVE spelling as published', () => {
    expect(productStatusBadge('ACTIVE')).toEqual({
      variant: 'default',
      label: 'Published',
    });
  });

  it('falls back to the raw status rather than hiding it', () => {
    expect(productStatusBadge('SOMETHING_NEW')).toEqual({
      variant: 'outline',
      label: 'SOMETHING_NEW',
    });
  });
});
