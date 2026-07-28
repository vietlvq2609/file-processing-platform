import type { FastifySchema } from 'fastify';

export const jobParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
} as const;

export const createJobBodySchema = {
  type: 'object',
  required: ['fileId'],
  properties: {
    fileId: { type: 'string', format: 'uuid' },
    type: { type: 'string', minLength: 1, default: 'default' },
  },
} as const;

export const listJobsQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    status: { type: 'string', enum: ['pending', 'active', 'completed', 'failed'] },
    fileId: { type: 'string', format: 'uuid' },
  },
} as const;

export const createJobSchema: FastifySchema = {
  body: createJobBodySchema,
};

export const listJobsSchema: FastifySchema = {
  querystring: listJobsQuerySchema,
};

export const jobByIdSchema: FastifySchema = {
  params: jobParamsSchema,
};
