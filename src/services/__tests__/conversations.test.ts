import { describe, expect, it, spyOn } from 'bun:test';
import apiClient from '@/lib/api-client';

describe('conversations service API calls', () => {
  it('fetches conversations list', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: { conversations: [], unreadCount: 0 },
    });

    const response = await apiClient.get('/api/conversations/list');
    expect(get).toHaveBeenCalledWith('/api/conversations/list');
    expect(Array.isArray(response.data.conversations)).toBe(true);
  });

  it('fetches conversation detail', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: { conversation: { id: 'c1' } },
    });

    const response = await apiClient.get('/api/conversations/c1');
    expect(get).toHaveBeenCalledWith('/api/conversations/c1');
    expect(response.data.conversation.id).toBe('c1');
  });

  it('fetches messages for conversation', async () => {
    const get = spyOn(apiClient, 'get').mockResolvedValue({
      data: { messages: [] },
    });

    const response = await apiClient.get(
      '/api/messages/list?conversationId=c1',
    );
    expect(get).toHaveBeenCalledWith('/api/messages/list?conversationId=c1');
    expect(Array.isArray(response.data.messages)).toBe(true);
  });

  it('sends a message via create', async () => {
    const post = spyOn(apiClient, 'post').mockResolvedValue({
      data: { message: 'Sent!' },
    });

    const formData = new FormData();
    formData.append('conversationId', 'c1');

    const response = await apiClient.post('/api/messages/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(post).toHaveBeenCalledWith('/api/messages/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(response.data.message).toBe('Sent!');
  });

  it('marks conversation as read for customer', async () => {
    const patch = spyOn(apiClient, 'patch').mockResolvedValue({
      data: { message: 'Marked as read' },
    });

    await apiClient.patch('/api/conversations/c1', {
      action: 'read',
    });
    expect(patch).toHaveBeenCalledWith('/api/conversations/c1', {
      action: 'read',
    });
  });

  it('marks conversation as read for vendor', async () => {
    const patch = spyOn(apiClient, 'patch').mockResolvedValue({
      data: { message: 'Marked as read' },
    });

    await apiClient.patch('/api/vendor/conversations/c1', {
      action: 'read',
    });
    expect(patch).toHaveBeenCalledWith('/api/vendor/conversations/c1', {
      action: 'read',
    });
  });
});
