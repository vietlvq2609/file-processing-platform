import type { FastifySchema } from 'fastify';

export const createApiKeySchema: FastifySchema = {
  body: {
    type: 'object',
    additionalProperties: false,
    properties: {},
  },
};

export const revokeApiKeySchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
};
