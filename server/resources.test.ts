import { expect, it, vi } from 'vitest';
import { buildApp } from './app.js';
import { createSwapiClient } from './swapi.js';

it.each([
  [
    'planets',
    {
      name: 'Tatooine',
      climate: 'arid',
      terrain: 'desert',
      population: 'unknown',
    },
    'Tatooine',
  ],
  [
    'films',
    {
      title: 'A New Hope',
      episode_id: 4,
      release_date: '1977-05-25',
      director: 'George Lucas',
    },
    'A New Hope',
  ],
  [
    'starships',
    { name: 'X-wing', model: 'T-65 X-wing', manufacturer: 'Incom', crew: '1' },
    'X-wing',
  ],
  [
    'vehicles',
    { name: 'Snowspeeder', model: 'T-47', manufacturer: 'Incom', crew: '2' },
    'Snowspeeder',
  ],
] as const)(
  'serves and caches the %s collection through an owned contract',
  async (kind, fields, name) => {
    const fetcher = vi.fn(
      async () =>
        new Response(
          JSON.stringify([
            { ...fields, url: `https://swapi.info/api/${kind}/1` },
          ]),
        ),
    );
    const app = buildApp({ client: createSwapiClient({ fetcher }) });
    try {
      const response = await app.inject(`/api/archive/${kind}`);
      expect(response.statusCode).toBe(200);
      expect(response.json().records[0]).toMatchObject({ id: '1', name });
      expect(response.body).not.toContain('https://swapi.info');
      await app.inject(`/api/archive/${kind}`);
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(fetcher).toHaveBeenCalledWith(
        `https://swapi.info/api/${kind}`,
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect((await app.inject('/api/archive/private')).statusCode).toBe(404);
      expect(fetcher).toHaveBeenCalledTimes(1);
    } finally {
      await app.close();
    }
  },
);
