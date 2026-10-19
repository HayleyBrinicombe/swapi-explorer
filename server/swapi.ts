import { z } from 'zod';
import type { ApiErrorCode } from '../shared/contracts.js';
const resourceUrl = (kind: string) =>
  z
    .string()
    .regex(new RegExp(`^https://swapi\\.info/api/${kind}/[1-9]\\d*/?$`));
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
  homeworld: resourceUrl('planets'),
  films: z.array(resourceUrl('films')),
  starships: z.array(resourceUrl('starships')),
  vehicles: z.array(resourceUrl('vehicles')),
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
  // Each fixed collection has its own bounded cache and in-flight request.
  function collection<T>(kind: string, schema: z.ZodType<T>) {
    let cache: { records: T[]; expires: number } | undefined;
    let pending: Promise<T[]> | undefined;
    async function load(): Promise<T[]> {
      const signal = AbortSignal.timeout(timeoutMs);
      try {
        const response = await fetcher(`https://swapi.info/api/${kind}`, {
          signal,
        });
        if (!response.ok) throw new Error(`SWAPI returned ${response.status}`);
        const records = z.array(schema).parse(await response.json());
        cache = { records, expires: now() + ttlMs };
        return records;
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
    return (): Promise<T[]> => {
      if (cache && now() < cache.expires) return Promise.resolve(cache.records);
      if (!pending)
        pending = load().finally(() => {
          pending = undefined;
        });
      return pending;
    };
  }
  const craft = (kind: string) =>
    z.object({
      url: resourceUrl(kind),
      name: z.string(),
      model: z.string(),
      manufacturer: z.string(),
      crew: z.string(),
    });
  return {
    getPeople: collection('people', personSchema),
    getPlanets: collection(
      'planets',
      z.object({
        url: resourceUrl('planets'),
        name: z.string(),
        climate: z.string(),
        terrain: z.string(),
        population: z.string(),
      }),
    ),
    getFilms: collection(
      'films',
      z.object({
        url: resourceUrl('films'),
        title: z.string(),
        episode_id: z.number().int().min(1).max(6),
        release_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        director: z.string(),
      }),
    ),
    getStarships: collection('starships', craft('starships')),
    getVehicles: collection('vehicles', craft('vehicles')),
  };
}
export type SwapiClient = ReturnType<typeof createSwapiClient>;
