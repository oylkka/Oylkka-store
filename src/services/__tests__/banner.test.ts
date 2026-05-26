import { describe, expect, it, spyOn } from 'bun:test';
import apiClient from '@/lib/api-client';

const mockHeroBanner = {
  id: 'b1',
  title: 'Summer Sale',
  subTitle: 'Big discounts',
  description: 'Shop now',
  imageUrl: '/banner.jpg',
  imagePublicId: 'banner-pub',
};

const mockAdminBanner = {
  id: 'b1',
  title: 'Summer Sale',
  subTitle: 'Big discounts',
  description: 'Shop now',
  imageUrl: '/banner.jpg',
  imagePublicId: 'banner-pub',
  bannerTag: null,
  alignment: 'center',
  bannerPosition: 'hero',
  primaryActionText: null,
  primaryActionLink: null,
  secondaryActionText: null,
  secondaryActionLink: null,
  isActive: true,
  startDate: null,
  endDate: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('banner service API calls', () => {
  it('fetches hero banners', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: [mockHeroBanner],
    });

    const response = await apiClient.get('/api/banners/hero');
    expect(get).toHaveBeenCalledWith('/api/banners/hero');
    expect(response.data).toEqual([mockHeroBanner]);
  });

  it('fetches admin banners list', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: [mockAdminBanner],
    });

    const response = await apiClient.get('/api/banners/admin-list');
    expect(get).toHaveBeenCalledWith('/api/banners/admin-list');
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('fetches single banner by id', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: mockAdminBanner,
    });

    const response = await apiClient.get('/api/banners/get-single', {
      params: { id: 'b1' },
    });
    expect(get).toHaveBeenCalledWith('/api/banners/get-single', {
      params: { id: 'b1' },
    });
    expect(response.data.id).toBe('b1');
  });

  it('creates a banner', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Banner created successfully!', banner: mockHeroBanner },
    });

    const formData = new FormData();
    formData.append('title', 'New Banner');

    const response = await apiClient.post('/api/banners/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(post).toHaveBeenCalledWith('/api/banners/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(response.data.message).toBe('Banner created successfully!');
  });

  it('edits a banner', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Banner updated successfully!' },
    });

    const formData = new FormData();
    formData.append('id', 'b1');
    formData.append('title', 'Updated');

    const response = await apiClient.post('/api/banners/edit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(post).toHaveBeenCalledWith('/api/banners/edit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(response.data.message).toBe('Banner updated successfully!');
  });

  it('deletes a banner', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Banner deleted successfully!' },
    });

    const response = await apiClient.post('/api/banners/delete', { id: 'b1' });
    expect(post).toHaveBeenCalledWith('/api/banners/delete', { id: 'b1' });
    expect(response.data.message).toBe('Banner deleted successfully!');
  });
});
