import { describe, expect, it, spyOn } from 'bun:test';
import apiClient from '@/lib/api-client';

const mockWallet = {
  id: 'w1',
  userId: 'u1',
  balance: 5000,
  transactions: [
    {
      id: 't1',
      type: 'TOP_UP',
      amount: 5000,
      reference: null,
      orderId: null,
      description: 'Top up',
      createdAt: '2025-01-01T00:00:00Z',
    },
  ],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('wallet service API calls', () => {
  it('fetches wallet', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: mockWallet,
    });

    const response = await apiClient.get('/api/wallet/get');
    expect(get).toHaveBeenCalledWith('/api/wallet/get');
    expect(response.data.balance).toBe(5000);
  });

  it('tops up wallet', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Wallet topped up successfully!' },
    });

    const response = await apiClient.post('/api/wallet/top-up', {
      amount: 1000,
    });
    expect(post).toHaveBeenCalledWith('/api/wallet/top-up', { amount: 1000 });
    expect(response.data.message).toBe('Wallet topped up successfully!');
  });
});
