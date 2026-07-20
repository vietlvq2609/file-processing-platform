import type { FastifyInstance } from 'fastify';
import { AppError } from '../utils/errors.js';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    // AppError: known domain error — map directly to HTTP response
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: { code: error.code, message: error.message },
      });
    }

    // Fastify validation error (schema mismatch)
    if (error.validation) {
      return reply.status(422).send({
        error: { code: 'VALIDATION_ERROR', message: error.message },
      });
    }

    // Unknown error — log it and hide details from the client
    app.log.error(error);
    return reply.status(500).send({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });
}
