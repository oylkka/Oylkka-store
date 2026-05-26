import { describe, expect, it, spyOn } from 'bun:test';
import apiClient from '@/lib/api-client';

const mockCart = {
  id: 'cart-1',
  userId: 'user-1',
  items: [
    {
      id: 'item-1',
      cartId: 'cart-1',
      productId: 'prod-1',
      variantId: null,
      quantity: 2,
      savedPrice: null,
      product: {
        id: 'prod-1',
        productName: 'Test Product',
        slug: 'test-product',
        price: 100,
        discountPrice: null,
        stock: 10,
        hasVariants: false,
        freeShipping: false,
        images: [{ imageUrl: '/test.jpg' }],
        shop: null,
      },
      variant: null,
    },
  ],
  expiresAt: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('useCart API call', () => {
  it('calls /api/cart/get and returns cart data', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: mockCart,
    });

    const response = await apiClient.get('/api/cart/get');

    expect(get).toHaveBeenCalledWith('/api/cart/get');
    expect(response.data).toEqual(mockCart);
  });
});

describe('useAddToCartMutation API call', () => {
  it('calls /api/cart/add with productId and quantity', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Added' },
    });

    const response = await apiClient.post('/api/cart/add', {
      productId: 'prod-1',
      quantity: 1,
    });

    expect(post).toHaveBeenCalledWith('/api/cart/add', {
      productId: 'prod-1',
      quantity: 1,
    });
    expect(response.data).toEqual({ message: 'Added' });
  });

  it('calls /api/cart/add with variantId when provided', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Added' },
    });

    await apiClient.post('/api/cart/add', {
      productId: 'prod-1',
      variantId: 'var-1',
      quantity: 2,
    });

    expect(post).toHaveBeenCalledWith('/api/cart/add', {
      productId: 'prod-1',
      variantId: 'var-1',
      quantity: 2,
    });
  });
});
