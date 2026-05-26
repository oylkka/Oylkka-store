import { describe, expect, it, spyOn } from 'bun:test';
import apiClient from '@/lib/api-client';

const mockAdminCategory = {
  id: 'c1',
  name: 'Electronics',
  slug: 'electronics',
  description: 'Gadgets',
  imageUrl: null,
  imagePublicId: null,
  parentId: null,
  parent: null,
  featured: false,
  order: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  _count: { products: 5, children: 0 },
};

const mockPublicCategory = {
  id: 'c1',
  name: 'Electronics',
  slug: 'electronics',
  imageUrl: null,
  imagePublicId: null,
  description: 'Gadgets',
  parentId: null,
  order: 1,
};

describe('category service API calls', () => {
  it('fetches admin categories list', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: [mockAdminCategory],
    });

    const response = await apiClient.get('/api/categories/list');
    expect(get).toHaveBeenCalledWith('/api/categories/list');
    expect(response.data).toEqual([mockAdminCategory]);
  });

  it('fetches public categories', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: [mockPublicCategory],
    });

    const response = await apiClient.get('/api/categories/public-list');
    expect(get).toHaveBeenCalledWith('/api/categories/public-list');
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('fetches single category by id', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: mockAdminCategory,
    });

    const response = await apiClient.get('/api/categories/get-single', {
      params: { id: 'c1' },
    });
    expect(get).toHaveBeenCalledWith('/api/categories/get-single', {
      params: { id: 'c1' },
    });
    expect(response.data.id).toBe('c1');
  });

  it('creates a category', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        message: 'Category created successfully!',
        category: mockAdminCategory,
      },
    });

    const formData = new FormData();
    formData.append('name', 'New Cat');

    const response = await apiClient.post('/api/categories/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(post).toHaveBeenCalledWith('/api/categories/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(response.data.message).toBe('Category created successfully!');
  });

  it('edits a category', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        message: 'Category updated successfully!',
        category: mockAdminCategory,
      },
    });

    const formData = new FormData();
    formData.append('id', 'c1');

    const response = await apiClient.post('/api/categories/edit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(post).toHaveBeenCalledWith('/api/categories/edit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(response.data.message).toBe('Category updated successfully!');
  });

  it('deletes a category', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Category deleted successfully!' },
    });

    const response = await apiClient.post('/api/categories/delete', {
      id: 'c1',
    });
    expect(post).toHaveBeenCalledWith('/api/categories/delete', { id: 'c1' });
    expect(response.data.message).toBe('Category deleted successfully!');
  });
});
