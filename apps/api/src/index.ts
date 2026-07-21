import { buildApp } from './server.js';
import { config } from './config.js';

const app = buildApp();

try {
  await app.listen({ port: config.server.port, host: config.server.host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
