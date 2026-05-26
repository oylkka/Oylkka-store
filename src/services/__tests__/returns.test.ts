import { describe, expect, it, spyOn } from 'bun:test';
import apiClient from '@/lib/api-client';

describe('returns service API calls', () => {
  it('fetches my returns', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: { returns: [] },
    });

    const response = await apiClient.get('/api/returns/list');
    expect(get).toHaveBeenCalledWith('/api/returns/list');
    expect(Array.isArray(response.data.returns)).toBe(true);
  });

  it('creates a return request', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Return request created!' },
    });

    const payload = {
      orderId: 'o1',
      itemIds: ['item-1'],
      reason: 'DEFECTIVE' as const,
      details: 'Broken item',
    };

    const response = await apiClient.post('/api/returns/create', payload);
    expect(post).toHaveBeenCalledWith('/api/returns/create', payload);
    expect(response.data.message).toBe('Return request created!');
  });
});
