// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { useResource } from './useResource';
const schema = z.object({ name: z.string() });
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('rejects malformed successful responses instead of rendering invalid records', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response('{"name":42}')),
  );
  const { result } = renderHook(() => useResource('/api/example', schema));
  await waitFor(() =>
    expect(result.current.resource).toEqual({
      status: 'error',
      message: 'The archive returned an unexpected response. Please try again.',
    }),
  );
});
it('ignores a slow previous request when the selected resource changes', async () => {
  const pending: {
    resolve: (response: Response) => void;
    signal: AbortSignal;
  }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(
      (_url, options) =>
        new Promise<Response>((resolve) =>
          pending.push({ resolve, signal: options.signal }),
        ),
    ),
  );
  const { result, rerender } = renderHook(
    ({ url }) => useResource(url, schema),
    { initialProps: { url: '/first' } },
  );
  rerender({ url: '/second' });
  expect(pending[0].signal.aborted).toBe(true);
  await act(async () => {
    pending[1].resolve(new Response('{"name":"Second"}'));
  });
  await waitFor(() =>
    expect(result.current.resource).toEqual({
      status: 'success',
      data: { name: 'Second' },
    }),
  );
  await act(async () => {
    pending[0].resolve(new Response('{"name":"First"}'));
  });
  expect(result.current.resource).toEqual({
    status: 'success',
    data: { name: 'Second' },
  });
});
it('cancels the active request when its component unmounts', () => {
  let signal: AbortSignal | undefined;
  vi.stubGlobal(
    'fetch',
    vi.fn((_url, options) => {
      signal = options.signal;
      return new Promise(() => {});
    }),
  );
  const { unmount } = renderHook(() => useResource('/api/example', schema));
  unmount();
  expect(signal?.aborted).toBe(true);
});
