import { beforeEach, describe, expect, it } from 'bun:test';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

function createMatchMedia(width: number) {
  const listeners: Record<string, Array<() => void>> = {};
  let matches = width < 768;
  const mql = {
    get matches() {
      return matches;
    },
    set matches(v: boolean) {
      matches = v;
    },
    media: '(max-width: 767px)',
    addEventListener: (event: string, listener: () => void) => {
      listeners[event] ??= [];
      listeners[event].push(listener);
    },
    removeEventListener: (event: string, listener: () => void) => {
      listeners[event] = listeners[event]?.filter((l) => l !== listener) ?? [];
    },
    dispatchEvent: (_event: Event) => {
      // biome-ignore lint/suspicious/useIterableCallbackReturn: this is fine
      listeners.change?.forEach((l) => l());
      return true;
    },
  };
  return mql;
}

describe('useIsMobile', () => {
  beforeEach(() => {
    const mql = createMatchMedia(1024);
    window.matchMedia = () => mql as unknown as MediaQueryList;
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    });
  });

  it('returns false on desktop width', () => {
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true on mobile width', () => {
    const mql = createMatchMedia(375);
    window.matchMedia = () => mql as unknown as MediaQueryList;
    Object.defineProperty(window, 'innerWidth', {
      value: 375,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('updates when resizing below breakpoint', async () => {
    const mql = createMatchMedia(1024);
    window.matchMedia = () => mql as unknown as MediaQueryList;
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    Object.defineProperty(window, 'innerWidth', {
      value: 480,
      writable: true,
      configurable: true,
    });
    mql.matches = true;

    act(() => {
      mql.dispatchEvent(new Event('change'));
    });

    await waitFor(() => expect(result.current).toBe(true));
  });

  it('updates when resizing above breakpoint', async () => {
    const mql = createMatchMedia(375);
    window.matchMedia = () => mql as unknown as MediaQueryList;
    Object.defineProperty(window, 'innerWidth', {
      value: 375,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    Object.defineProperty(window, 'innerWidth', {
      value: 1200,
      writable: true,
      configurable: true,
    });
    mql.matches = false;

    act(() => {
      mql.dispatchEvent(new Event('change'));
    });

    await waitFor(() => expect(result.current).toBe(false));
  });
});
