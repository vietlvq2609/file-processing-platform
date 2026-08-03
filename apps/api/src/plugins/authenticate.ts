import type { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';

import { config } from '../config.js';
import { AppError, unauthorized } from '../utils/errors.js';

/**
 * Fastify preHandler that verifies the Bearer access token and populates request.userId.
 * Add this to any route that requires authentication:
 *   { preHandler: [authenticate] }
 */
export function authenticate(request: FastifyRequest, _reply: FastifyReply): void {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw unauthorized('MISSING_TOKEN', 'Authorization token is required');
  }

  const token = authHeader.slice(7);

  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(token, config.jwt.accessSecret) as jwt.JwtPayload;
  } catch (err) {
    // Re-throw AppErrors (e.g. if somehow they reach this point)
    if (err instanceof AppError) throw err;
    throw unauthorized('INVALID_TOKEN', 'Token is invalid or expired');
  }

  const userId = payload.sub;
  if (!userId) {
    throw unauthorized('INVALID_TOKEN', 'Token payload is malformed');
  }

  request.userId = userId;
}
