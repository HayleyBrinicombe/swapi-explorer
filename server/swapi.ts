import { z } from 'zod';
import type { ApiErrorCode } from '../shared/contracts.js';
const personSchema = z.object({
  name: z.string(),
  height: z.string(),
  mass: z.string(),
  birth_year: z.string(),
  gender: z.string(),
  hair_color: z.string(),
  skin_color: z.string(),
  eye_color: z.string(),
  url: z.string().regex(/^https:\/\/swapi\.info\/api\/people\/[1-9]\d*\/?$/),
  films: z.array(z.string().url()),
  starships: z.array(z.string().url()),
  vehicles: z.array(z.string().url()),
});
export type SwapiPerson = z.infer<typeof personSchema>;
export class ApplicationError extends Error {
  constructor(
    public statusCode: number,
    public code: ApiErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
export function createSwapiClient({
  fetcher = fetch,
  now = Date.now,
  ttlMs = 300_000,
  timeoutMs = 5_000,
} = {}) {
  let cache: { people: SwapiPerson[]; expires: number } | undefined;
  let pending: Promise<SwapiPerson[]> | undefined;
  async function load(): Promise<SwapiPerson[]> {
    const signal = AbortSignal.timeout(timeoutMs);
    try {
      const response = await fetcher('https://swapi.info/api/people', {
        signal,
      });
      if (!response.ok) throw new Error(`SWAPI returned ${response.status}`);
      const people = z.array(personSchema).parse(await response.json());
      cache = { people, expires: now() + ttlMs };
      return people;
    } catch (cause) {
      if (signal.aborted)
        throw new ApplicationError(
          504,
          'UPSTREAM_TIMEOUT',
          'The archive source took too long to respond. Please try again.',
          { cause },
        );
      throw new ApplicationError(
        502,
        'UPSTREAM_UNAVAILABLE',
        'The archive source is unavailable. Please try again.',
        { cause },
      );
    }
  }
  return {
    getPeople(): Promise<SwapiPerson[]> {
      if (cache && now() < cache.expires) return Promise.resolve(cache.people);
      if (!pending)
        pending = load().finally(() => {
          pending = undefined;
        });
      return pending;
    },
  };
}
export type SwapiClient = ReturnType<typeof createSwapiClient>;
