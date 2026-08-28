import type { FastifySchema } from 'fastify';

const jobObjectSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    fileId: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    type: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'active', 'completed', 'failed'] },
    progress: { type: 'integer' },
    outputPath: { type: ['string', 'null'] },
    outputFileId: { type: ['string', 'null'], format: 'uuid' },
    errorMessage: { type: ['string', 'null'] },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
} as const;

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
    options: {
      type: 'object',
      properties: {
        quality: { type: 'integer', minimum: 1, maximum: 100 },
      },
      additionalProperties: false,
    },
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
  response: {
    201: { type: 'object', properties: { data: jobObjectSchema } },
  },
};

export const listJobsSchema: FastifySchema = {
  querystring: listJobsQuerySchema,
  response: {
    200: {
      type: 'object',
      properties: {
        data: { type: 'array', items: jobObjectSchema },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
  },
};

export const jobByIdSchema: FastifySchema = {
  params: jobParamsSchema,
  response: {
    200: { type: 'object', properties: { data: jobObjectSchema } },
  },
};
