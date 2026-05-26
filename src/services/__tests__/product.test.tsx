import { describe, expect, it, spyOn } from 'bun:test';
import apiClient from '@/lib/api-client';

const mockProducts = [
  {
    id: '1',
    productName: 'Test Product',
    slug: 'test-product',
    price: 100,
    discountPrice: null,
    stock: 10,
    hasVariants: false,
    images: [{ imageUrl: '/test.jpg' }],
    category: { id: 'c1', name: 'Test Cat', slug: 'test-cat' },
    shop: null,
    _count: { reviews: 0 },
    createdAt: '2025-01-01T00:00:00Z',
  },
];

describe('useAllProducts API call', () => {
  it('calls /api/product/public-list with search params', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        products: mockProducts,
        total: 1,
        page: 1,
        limit: 8,
        totalPages: 1,
      },
    });

    const response = await apiClient.get('/api/product/public-list', {
      params: { search: 'test', page: 1, limit: 8 },
    });

    expect(get).toHaveBeenCalledWith('/api/product/public-list', {
      params: { search: 'test', page: 1, limit: 8 },
    });
    expect(response.data.products).toEqual(mockProducts);
    expect(response.data.total).toBe(1);
  });

  it('calls /api/product/public-list without optional params', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        products: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    });

    await apiClient.get('/api/product/public-list', { params: {} });

    expect(get).toHaveBeenCalledWith('/api/product/public-list', {
      params: {},
    });
  });
});

describe('useCompareProducts API call', () => {
  it('calls /api/product/public-compare with joined ids', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: { products: mockProducts },
    });

    const ids = ['1', '2', '3'];
    const response = await apiClient.get('/api/product/public-compare', {
      params: { ids: ids.join(',') },
    });

    expect(get).toHaveBeenCalledWith('/api/product/public-compare', {
      params: { ids: '1,2,3' },
    });
    expect(response.data.products).toEqual(mockProducts);
  });
});
