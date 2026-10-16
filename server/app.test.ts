import { describe, it, expect, vi } from 'vitest';
import { buildApp } from './app.js';
import { createSwapiClient } from './swapi.js';
import { toCharacter } from './characters.js';
const person = {
  name: 'Luke Skywalker',
  height: '172',
  mass: '77',
  birth_year: '19BBY',
  gender: 'male',
  hair_color: 'blond',
  skin_color: 'fair',
  eye_color: 'blue',
  url: 'https://swapi.info/api/people/1',
  films: ['https://swapi.info/api/films/1'],
  vehicles: [],
  starships: [],
};
const response = () => new Response(JSON.stringify([person]));
describe('archive API', () => {
  it('transforms source data without leaking upstream URLs or changing unknown values', () => {
    expect(
      toCharacter({
        ...person,
        mass: 'unknown',
        url: 'https://swapi.info/api/people/83',
      }),
    ).toEqual({
      id: '83',
      name: 'Luke Skywalker',
      height: '172',
      mass: 'unknown',
      birthYear: '19BBY',
      gender: 'male',
      hairColor: 'blond',
      skinColor: 'fair',
      eyeColor: 'blue',
      filmCount: 1,
      starshipCount: 0,
      vehicleCount: 0,
    });
  });
  it('serves lists and detail, validates IDs before fetching, and distinguishes missing characters', async () => {
    const fetcher = vi.fn().mockImplementation(response);
    const app = buildApp({ client: createSwapiClient({ fetcher }) });
    try {
      expect((await app.inject('/api/characters/nope')).statusCode).toBe(400);
      expect(fetcher).not.toHaveBeenCalled();
      expect(
        (await app.inject('/api/characters')).json().characters[0].name,
      ).toBe(person.name);
      expect((await app.inject('/api/characters/1')).json().character.id).toBe(
        '1',
      );
      expect((await app.inject('/api/characters/999')).statusCode).toBe(404);
      expect(fetcher).toHaveBeenCalledTimes(1);
    } finally {
      await app.close();
    }
  });
  it.each([
    [
      'network failure',
      () => Promise.reject(new Error('secret internal details')),
    ],
    [
      'HTTP failure',
      () => Promise.resolve(new Response('broken', { status: 503 })),
    ],
    ['invalid data', () => Promise.resolve(new Response('[{"name":42}]'))],
  ])('returns safe errors for %s and permits recovery', async (_name, fail) => {
    const fetcher = vi
      .fn()
      .mockImplementationOnce(fail)
      .mockImplementation(response);
    const app = buildApp({ client: createSwapiClient({ fetcher }) });
    try {
      const result = await app.inject('/api/characters');
      expect(result.statusCode).toBe(502);
      expect(result.json().error.code).toBe('UPSTREAM_UNAVAILABLE');
      expect(result.body).not.toContain('secret');
      expect((await app.inject('/api/characters')).statusCode).toBe(200);
    } finally {
      await app.close();
    }
  });
  it('maps an upstream timeout to 504', async () => {
    const fetcher: typeof fetch = (_url, options) =>
      new Promise((_resolve, reject) =>
        options?.signal?.addEventListener('abort', () =>
          reject(options.signal?.reason),
        ),
      );
    const app = buildApp({
      client: createSwapiClient({ fetcher, timeoutMs: 5 }),
    });
    try {
      expect((await app.inject('/api/characters')).statusCode).toBe(504);
    } finally {
      await app.close();
    }
  });
  it('shares in-flight requests and refreshes expired cache entries', async () => {
    let clock = 0;
    const fetcher = vi.fn().mockImplementation(response);
    const client = createSwapiClient({ fetcher, now: () => clock, ttlMs: 100 });
    await Promise.all([client.getPeople(), client.getPeople()]);
    await client.getPeople();
    expect(fetcher).toHaveBeenCalledTimes(1);
    clock = 101;
    await client.getPeople();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
