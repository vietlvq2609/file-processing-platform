import type { JobStatus } from '@fpp/types';
import type { FastifyInstance } from 'fastify';

import { authenticate } from '../../plugins/authenticate.js';
import type { JobService } from '../../services/JobService.js';
import { createJobSchema, jobByIdSchema, listJobsSchema } from './schemas.js';

export function jobRoutes(service: JobService) {
  return function routes(app: FastifyInstance) {
    app.addHook('preHandler', authenticate);

    // ─── POST /jobs ──────────────────────────────────────────────────────────
    // Submit a new processing job for an uploaded file.
    app.post('/', { schema: createJobSchema }, async (request, reply) => {
      const { fileId, type } = request.body as { fileId: string; type?: string };
      const job = await service.create(request.userId, fileId, type);
      return reply.status(201).send({ data: job });
    });

    // ─── GET /jobs ───────────────────────────────────────────────────────────
    // List jobs for the current user with optional status/fileId filters.
    app.get('/', { schema: listJobsSchema }, async (request, reply) => {
      const query = request.query as {
        page: number;
        limit: number;
        status?: JobStatus;
        fileId?: string;
      };
      const result = await service.list(request.userId, query);
      return reply.send(result);
    });

    // ─── GET /jobs/:id ───────────────────────────────────────────────────────
    // Get the status and metadata of a single job.
    app.get('/:id', { schema: jobByIdSchema }, async (request, reply) => {
      const { id } = request.params as { id: string };
      const job = await service.findById(request.userId, id);
      return reply.send({ data: job });
    });

    // ─── DELETE /jobs/:id ────────────────────────────────────────────────────
    // Cancel a job. Only works while the job is still in 'pending' state.
    app.delete('/:id', { schema: jobByIdSchema }, async (request, reply) => {
      const { id } = request.params as { id: string };
      await service.cancel(request.userId, id);
      return reply.status(204).send();
    });
  };
}
