import type { z } from 'zod';
/** HTTP boundary: validate every successful response before it reaches React state. */
export async function fetchResource<T>(
  url: string,
  schema: z.ZodType<T>,
  signal: AbortSignal,
): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok)
    throw new Error(
      response.status === 404
        ? 'This character could not be found.'
        : 'The archive is temporarily unavailable. Please try again.',
    );
  return schema.parse(await response.json());
}
export function resourceErrorMessage(error: unknown): string {
  if (error instanceof TypeError)
    return 'Unable to connect to the archive. Check your connection and try again.';
  if (
    error instanceof Error &&
    error.name !== 'ZodError' &&
    !(error instanceof SyntaxError)
  )
    return error.message;
  return 'The archive returned an unexpected response. Please try again.';
}
