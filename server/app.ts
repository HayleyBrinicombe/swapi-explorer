import Fastify from 'fastify';
import type { ApiError } from '../shared/contracts.js';
import {
  createSwapiClient,
  ApplicationError,
  type SwapiClient,
} from './swapi.js';
import { createCharacterService } from './characters.js';
export function buildApp({
  client = createSwapiClient(),
  logger = false,
}: { client?: SwapiClient; logger?: boolean } = {}) {
  const app = Fastify({ logger, bodyLimit: 16_384 });
  const service = createCharacterService(client);
  app.setErrorHandler((error, request, reply) => {
    if (
      typeof error === 'object' &&
      error !== null &&
      'validation' in error &&
      error.validation
    )
      return reply
        .code(400)
        .send({
          error: {
            code: 'INVALID_REQUEST',
            message:
              'Character IDs must be positive integers of at most six digits.',
          },
        } satisfies ApiError);
    if (error instanceof ApplicationError) {
      if (error.statusCode >= 500)
        request.log.error({ err: error }, 'Upstream request failed');
      return reply
        .code(error.statusCode)
        .send({
          error: { code: error.code, message: error.message },
        } satisfies ApiError);
    }
    request.log.error({ err: error }, 'Unexpected request failure');
    return reply
      .code(500)
      .send({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Something went wrong. Please try again.',
        },
      } satisfies ApiError);
  });
  app.get('/api/characters', async () => ({
    characters: await service.list(),
  }));
  app.get<{ Params: { id: string } }>(
    '/api/characters/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          additionalProperties: false,
          properties: { id: { type: 'string', pattern: '^[1-9][0-9]{0,5}$' } },
        },
      },
    },
    async (request) => ({ character: await service.get(request.params.id) }),
  );
  app.setNotFoundHandler((_request, reply) =>
    reply
      .code(404)
      .send({
        error: { code: 'NOT_FOUND', message: 'This endpoint does not exist.' },
      } satisfies ApiError),
  );
  return app;
}
