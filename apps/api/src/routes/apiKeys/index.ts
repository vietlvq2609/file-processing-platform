import type { FastifyInstance } from 'fastify';

import { authenticate } from '../../plugins/authenticate.js';
import { requireRegisteredUser } from '../../plugins/requireRegisteredUser.js';
import type { ApiKeyService } from '../../services/ApiKeyService.js';
import { createApiKeySchema, revokeApiKeySchema } from './schemas.js';

export function apiKeyRoutes(service: ApiKeyService) {
  return function routes(app: FastifyInstance) {
    // ─── GET /api-keys ───────────────────────────────────────────────────────
    // Lists all API keys for the authenticated user. Keys are masked. Registered accounts only.
    app.get('/', { preHandler: [authenticate, requireRegisteredUser] }, async (request, reply) => {
      const keys = await service.listKeys(request.userId);
      return reply.send({ data: keys });
    });

    // ─── POST /api-keys ──────────────────────────────────────────────────────
    // Creates a new API key. The full plaintext key is returned only here. Registered accounts only.
    app.post(
      '/',
      { schema: createApiKeySchema, preHandler: [authenticate, requireRegisteredUser] },
      async (request, reply) => {
        const { key, fullKey } = await service.createKey(request.userId);
        return reply.status(201).send({ data: key, fullKey });
      }
    );

    // ─── DELETE /api-keys/:id ────────────────────────────────────────────────
    // Revokes an API key. Only the owning user can revoke their own keys. Registered accounts only.
    app.delete<{ Params: { id: string } }>(
      '/:id',
      { schema: revokeApiKeySchema, preHandler: [authenticate, requireRegisteredUser] },
      async (request, reply) => {
        await service.revokeKey(request.userId, request.params.id);
        return reply.status(204).send();
      }
    );
  };
}
