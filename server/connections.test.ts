import { expect, it, vi } from 'vitest';
import { buildApp } from './app.js';
import { createSwapiClient } from './swapi.js';

const url = (kind: string, id: number) =>
  `https://swapi.info/api/${kind}/${id}`;
const person = {
  name: 'Luke Skywalker',
  height: '172',
  mass: '77',
  birth_year: '19BBY',
  gender: 'male',
  hair_color: 'blond',
  skin_color: 'fair',
  eye_color: 'blue',
  url: url('people', 1),
  homeworld: url('planets', 1),
  films: [url('films', 1)],
  starships: [url('starships', 12)],
  vehicles: [],
};
const sources: Record<string, unknown[]> = {
  people: [person],
  planets: [
    {
      url: url('planets', 1),
      name: 'Tatooine',
      climate: 'arid',
      terrain: 'desert',
      population: '200000',
    },
  ],
  films: [
    {
      url: url('films', 1),
      title: 'A New Hope',
      episode_id: 4,
      release_date: '1977-05-25',
      director: 'George Lucas',
    },
  ],
  starships: [
    {
      url: url('starships', 12),
      name: 'X-wing',
      model: 'T-65 X-wing',
      manufacturer: 'Incom Corporation',
      crew: '1',
    },
  ],
};
it('resolves named connections, keeps empty groups explicit and caches each collection', async () => {
  const fetcher = vi.fn(async (input: string | URL | Request) => {
    const kind = String(input).split('/').at(-1)!;
    return new Response(JSON.stringify(sources[kind]));
  });
  const app = buildApp({ client: createSwapiClient({ fetcher }) });
  try {
    const response = await app.inject('/api/characters/1/connections');
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      homeworld: {
        id: '1',
        name: 'Tatooine',
        facts: expect.arrayContaining([{ label: 'Climate', value: 'arid' }]),
      },
      films: [{ id: '1', name: 'A New Hope', subtitle: 'Episode IV · 1977' }],
      starships: [{ id: '12', name: 'X-wing' }],
      vehicles: [],
    });
    await app.inject('/api/characters/1/connections');
    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(
      (await app.inject('/api/characters/999/connections')).statusCode,
    ).toBe(404);
    expect(
      (await app.inject('/api/characters/nope/connections')).statusCode,
    ).toBe(400);
  } finally {
    await app.close();
  }
});
it('isolates related-data failure from the base character profile and permits retry', async () => {
  let broken = true;
  const fetcher = vi.fn(async (input: string | URL | Request) => {
    const kind = String(input).split('/').at(-1)!;
    if (kind === 'films' && broken)
      return new Response('unavailable', { status: 503 });
    return new Response(JSON.stringify(sources[kind]));
  });
  const app = buildApp({ client: createSwapiClient({ fetcher }) });
  try {
    expect((await app.inject('/api/characters/1/connections')).statusCode).toBe(
      502,
    );
    expect((await app.inject('/api/characters/1')).statusCode).toBe(200);
    broken = false;
    expect((await app.inject('/api/characters/1/connections')).statusCode).toBe(
      200,
    );
  } finally {
    await app.close();
  }
});
it('rejects external relationship URLs instead of following them', async () => {
  const fetcher = vi.fn(
    async () =>
      new Response(
        JSON.stringify([
          { ...person, homeworld: 'https://example.com/private' },
        ]),
      ),
  );
  const app = buildApp({ client: createSwapiClient({ fetcher }) });
  try {
    expect((await app.inject('/api/characters/1/connections')).statusCode).toBe(
      502,
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  } finally {
    await app.close();
  }
});
