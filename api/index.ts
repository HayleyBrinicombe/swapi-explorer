import type { IncomingMessage, ServerResponse } from 'node:http';
import { buildApp } from '../server/app.js';

// One instance per warm function: retain the same routes, validation and cache.
const app = buildApp({ logger: true });

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse,
) {
  await app.ready();
  app.server.emit('request', request, response);
}
