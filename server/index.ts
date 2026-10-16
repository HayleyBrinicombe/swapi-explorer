import staticFiles from '@fastify/static';
import { resolve } from 'node:path';
import { buildApp } from './app.js';
const app = buildApp({ logger: true });
if (process.env.NODE_ENV === 'production') {
  await app.register(staticFiles, { root: resolve('dist/client') });
}
try {
  await app.listen({
    port: Number(process.env.PORT ?? 3001),
    host: '127.0.0.1',
  });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.once(signal, () => {
    void app.close();
  });
