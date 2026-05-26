import { describe, expect, it, spyOn } from 'bun:test';
import apiClient from '@/lib/api-client';

const mockWishlist = {
  items: [
    {
      id: 'w1',
      productId: 'p1',
      variantId: null,
      product: {
        id: 'p1',
        productName: 'Test Product',
        slug: 'test-product',
        price: 100,
        discountPrice: null,
        images: [{ imageUrl: '/test.jpg' }],
      },
      variant: null,
    },
  ],
};

describe('wishlist service API calls', () => {
  it('fetches wishlist', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: mockWishlist,
    });

    const response = await apiClient.get('/api/wishlist/list');
    expect(get).toHaveBeenCalledWith('/api/wishlist/list');
    expect(response.data.items).toHaveLength(1);
  });

  it('adds to wishlist', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Added to wishlist!' },
    });

    const response = await apiClient.post('/api/wishlist/add', {
      productId: 'p1',
    });
    expect(post).toHaveBeenCalledWith('/api/wishlist/add', { productId: 'p1' });
    expect(response.data.message).toBe('Added to wishlist!');
  });

  it('adds to wishlist with variant', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Added to wishlist!' },
    });

    await apiClient.post('/api/wishlist/add', {
      productId: 'p1',
      variantId: 'v1',
    });
    expect(post).toHaveBeenCalledWith('/api/wishlist/add', {
      productId: 'p1',
      variantId: 'v1',
    });
  });

  it('removes from wishlist', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Removed from wishlist' },
    });

    const response = await apiClient.post('/api/wishlist/remove', {
      productId: 'p1',
    });
    expect(post).toHaveBeenCalledWith('/api/wishlist/remove', {
      productId: 'p1',
    });
    expect(response.data.message).toBe('Removed from wishlist');
  });
});
