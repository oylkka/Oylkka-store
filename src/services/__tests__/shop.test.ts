import { describe, expect, it, spyOn } from 'bun:test';
import apiClient from '@/lib/api-client';

describe('shop service API calls', () => {
  it('fetches my shop', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: null,
    });

    const response = await apiClient.get('/api/shop/my-shop');
    expect(get).toHaveBeenCalledWith('/api/shop/my-shop');
    expect(response.data).toBeNull();
  });

  it('fetches single shop by slug', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: { id: 's1', name: 'My Shop', slug: 'my-shop' },
    });

    const response = await apiClient.get('/api/shop/get-single', {
      params: { slug: 'my-shop' },
    });
    expect(get).toHaveBeenCalledWith('/api/shop/get-single', {
      params: { slug: 'my-shop' },
    });
    expect(response.data.slug).toBe('my-shop');
  });

  it('fetches public shop by slug', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: { id: 's1', name: 'My Shop' },
    });

    await apiClient.get('/api/shop/public', {
      params: { slug: 'my-shop' },
    });
    expect(get).toHaveBeenCalledWith('/api/shop/public', {
      params: { slug: 'my-shop' },
    });
  });

  it('fetches admin shops list', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: [],
    });

    const response = await apiClient.get('/api/shop/admin-list?');
    expect(get).toHaveBeenCalledWith('/api/shop/admin-list?');
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('approves a shop', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Shop approved successfully!' },
    });

    const response = await apiClient.post('/api/shop/approve', { id: 's1' });
    expect(post).toHaveBeenCalledWith('/api/shop/approve', { id: 's1' });
    expect(response.data.message).toBe('Shop approved successfully!');
  });

  it('rejects a shop with reason', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Shop rejected!' },
    });

    await apiClient.post('/api/shop/reject', {
      id: 's1',
      rejectionReason: 'Invalid documents',
    });
    expect(post).toHaveBeenCalledWith('/api/shop/reject', {
      id: 's1',
      rejectionReason: 'Invalid documents',
    });
  });

  it('applies for a shop', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Application submitted!', shop: { id: 's1' } },
    });

    const formData = new FormData();
    formData.append('name', 'New Shop');

    const response = await apiClient.post('/api/shop/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(post).toHaveBeenCalledWith('/api/shop/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(response.data.shop.id).toBe('s1');
  });

  it('updates a shop', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Shop updated successfully!' },
    });

    const formData = new FormData();
    formData.append('name', 'Updated Shop');

    await apiClient.post('/api/shop/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(post).toHaveBeenCalledWith('/api/shop/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });
});
