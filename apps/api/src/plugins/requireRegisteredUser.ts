import type { FastifyReply, FastifyRequest } from 'fastify';

import { forbidden } from '../utils/errors.js';

/**
 * Fastify preHandler that blocks guest sessions from registered-account-only actions
 * (e.g. API keys, password changes). Must run after `authenticate` so request.role is set:
 *   { preHandler: [authenticate, requireRegisteredUser] }
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function requireRegisteredUser(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  if (request.role === 'guest') {
    throw forbidden('GUEST_NOT_ALLOWED', 'This action requires a registered account');
  }
}
