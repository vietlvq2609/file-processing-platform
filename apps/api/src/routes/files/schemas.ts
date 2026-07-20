import type { FastifySchema } from 'fastify';

// Shared params schema for routes that take a file UUID
export const fileParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
} as const;

// GET /files querystring
export const listFilesQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    search: { type: 'string', minLength: 1 },
  },
} as const;

export const listFilesSchema: FastifySchema = {
  querystring: listFilesQuerySchema,
};

export const fileByIdSchema: FastifySchema = {
  params: fileParamsSchema,
};
