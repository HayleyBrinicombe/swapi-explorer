import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

const request = globalThis.fetch;
let server: Server;
let origin: string;
const upstream = vi.fn().mockImplementation(
  async () =>
    new Response(
      JSON.stringify([
        {
          name: 'Luke Skywalker',
          height: '172',
          mass: '77',
          birth_year: '19BBY',
          gender: 'male',
          hair_color: 'blond',
          skin_color: 'fair',
          eye_color: 'blue',
          url: 'https://swapi.info/api/people/1',
          films: [],
          starships: [],
          vehicles: [],
        },
      ]),
    ),
);

beforeAll(async () => {
  vi.stubGlobal('fetch', upstream);
  const { default: handler } = await import('../api/index.js');
  server = createServer((req, res) => {
    void handler(req, res);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  if (server)
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  vi.unstubAllGlobals();
});

it('dispatches real HTTP requests through the same Fastify routes and shares the source cache', async () => {
  const [list, detail] = await Promise.all([
    request(`${origin}/api/characters`),
    request(`${origin}/api/characters/1`),
  ]);
  expect(list.status).toBe(200);
  expect((await list.json()).characters[0].name).toBe('Luke Skywalker');
  expect(detail.status).toBe(200);
  expect((await detail.json()).character.id).toBe('1');
  expect(upstream).toHaveBeenCalledTimes(1);
});

it('preserves API validation and missing-record errors in the hosted entry point', async () => {
  const invalid = await request(`${origin}/api/characters/nope`);
  expect(invalid.status).toBe(400);
  expect((await invalid.json()).error.code).toBe('INVALID_REQUEST');
  const missing = await request(`${origin}/api/characters/999`);
  expect(missing.status).toBe(404);
  expect((await missing.json()).error.code).toBe('NOT_FOUND');
});
