import { beforeEach, describe, expect, it } from 'bun:test';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useSkuCheck } from '@/hooks/use-sku-check';

describe('useSkuCheck', () => {
  beforeEach(() => {
    globalThis.fetch = (async (url: string) => {
      if (url.includes('check-sku')) {
        return new Response(JSON.stringify({ available: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response('Not Found', { status: 404 });
    }) as unknown as typeof fetch;
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useSkuCheck());
    expect(result.current.isChecking).toBe(false);
    expect(result.current.isAvailable).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('ignores empty SKU', () => {
    const { result } = renderHook(() => useSkuCheck());
    act(() => {
      result.current.checkSkuAvailability('');
    });
    expect(result.current.isAvailable).toBeNull();
    expect(result.current.isChecking).toBe(false);
  });

  it('ignores short SKU (less than 3 chars)', () => {
    const { result } = renderHook(() => useSkuCheck());
    act(() => {
      result.current.checkSkuAvailability('ab');
    });
    expect(result.current.isAvailable).toBeNull();
    expect(result.current.isChecking).toBe(false);
  });

  it('skips duplicate SKU', () => {
    const { result } = renderHook(() => useSkuCheck());
    act(() => {
      result.current.checkSkuAvailability('SKU-001');
    });
    expect(result.current.isChecking).toBe(true);

    act(() => {
      result.current.checkSkuAvailability('SKU-001');
    });
    expect(result.current.isChecking).toBe(true);
  });

  it('sets checking state immediately then resolves', async () => {
    const { result } = renderHook(() => useSkuCheck());
    act(() => {
      result.current.checkSkuAvailability('SKU-001');
    });
    expect(result.current.isChecking).toBe(true);

    await waitFor(
      () => {
        expect(result.current.isAvailable).toBe(true);
      },
      { timeout: 1000 },
    );
    expect(result.current.isChecking).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    globalThis.fetch = (async () => {
      throw new Error('Network error');
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useSkuCheck());
    act(() => {
      result.current.checkSkuAvailability('SKU-001');
    });

    await waitFor(
      () => {
        expect(result.current.error).toBe('Failed to check SKU availability');
      },
      { timeout: 1000 },
    );
    expect(result.current.isChecking).toBe(false);
    expect(result.current.isAvailable).toBeNull();
  });

  it('includes productId in request when provided', async () => {
    let requestUrl = '';
    globalThis.fetch = (async (url: string) => {
      requestUrl = url.toString();
      return new Response(JSON.stringify({ available: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useSkuCheck({ productId: 'prod-1' }));
    act(() => {
      result.current.checkSkuAvailability('SKU-001');
    });

    await waitFor(() => expect(result.current.isAvailable).toBe(true), {
      timeout: 1000,
    });
    expect(requestUrl).toContain('sku=SKU-001');
    expect(requestUrl).toContain('productId=prod-1');
  });
});
