import { fetchResource, resourceErrorMessage } from '../services/archiveApi';
import { useEffect, useState } from 'react';
import type { z } from 'zod';
type Resource<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };
export function useResource<T>(url: string, schema: z.ZodType<T>) {
  const [attempt, setAttempt] = useState(0);
  const [resource, setResource] = useState<Resource<T>>({ status: 'loading' });
  useEffect(() => {
    const controller = new AbortController();
    setResource({ status: 'loading' });
    async function load() {
      try {
        const data = await fetchResource(url, schema, controller.signal);
        if (!controller.signal.aborted)
          setResource({ status: 'success', data });
      } catch (error) {
        if (!controller.signal.aborted)
          setResource({
            status: 'error',
            message: resourceErrorMessage(error),
          });
      }
    }
    void load();
    return () => controller.abort();
  }, [url, schema, attempt]);
  return { resource, retry: () => setAttempt((value) => value + 1) };
}
