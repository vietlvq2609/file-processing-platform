import type { FastifyInstance } from 'fastify';

import { authenticate } from '../../plugins/authenticate.js';
import type { FileService } from '../../services/FileService.js';
import { createUploadUrlSchema, fileByIdSchema, listFilesSchema } from './schemas.js';

export function fileRoutes(service: FileService) {
  return function routes(app: FastifyInstance) {
    // All file routes require a valid access token.
    app.addHook('preHandler', authenticate);

    // ─── POST /files/upload-url ────────────────────────────────────────────────
    // Reserves a "pending" file record and returns a presigned MinIO POST policy.
    // The browser uploads directly to storage, bypassing the API server.
    app.post('/upload-url', { schema: createUploadUrlSchema }, async (request, reply) => {
      const body = request.body as { filename: string; mimeType: string; size: number };
      const result = await service.createUploadUrl(request.userId, body);
      return reply.status(201).send({ data: result });
    });

    // ─── POST /files/:id/confirm-upload ────────────────────────────────────────
    // Verifies the uploaded object exists in storage and marks the file "ready".
    app.post('/:id/confirm-upload', { schema: fileByIdSchema }, async (request, reply) => {
      const { id } = request.params as { id: string };
      const file = await service.confirmUpload(request.userId, id);
      return reply.send({ data: file });
    });

    // ─── GET /files ───────────────────────────────────────────────────────────
    // List all non-deleted files for the current user.
    // Query params: page, limit, search
    app.get('/', { schema: listFilesSchema }, async (request, reply) => {
      const query = request.query as { page: number; limit: number; search?: string };
      const result = await service.list(request.userId, query);
      return reply.send(result);
    });

    // ─── GET /files/:id ───────────────────────────────────────────────────────
    // Fetch metadata for a single file.
    app.get('/:id', { schema: fileByIdSchema }, async (request, reply) => {
      const { id } = request.params as { id: string };
      const file = await service.findById(request.userId, id);
      return reply.send({ data: file });
    });

    // ─── DELETE /files/:id ────────────────────────────────────────────────────
    // Soft-delete a file (sets status = 'deleted', does not remove from disk).
    app.delete('/:id', { schema: fileByIdSchema }, async (request, reply) => {
      const { id } = request.params as { id: string };
      await service.delete(request.userId, id);
      return reply.status(204).send();
    });

    // ─── GET /files/:id/download ──────────────────────────────────────────────
    // Stream the file back to the client with correct Content-Type.
    app.get('/:id/download', { schema: fileByIdSchema }, async (request, reply) => {
      const { id } = request.params as { id: string };
      const { stream, file } = await service.getDownloadStream(request.userId, id);

      return reply
        .header('Content-Type', file.mimeType)
        .header('Content-Disposition', `attachment; filename="${file.originalName}"`)
        .header('Content-Length', String(file.size))
        .send(stream);
    });
  };
}
