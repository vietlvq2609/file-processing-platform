import type { FastifyInstance } from 'fastify';

import { authenticate } from '../../plugins/authenticate.js';
import type { FileService } from '../../services/FileService.js';
import { badRequest } from '../../utils/errors.js';
import { fileByIdSchema, listFilesSchema } from './schemas.js';

export function fileRoutes(service: FileService) {
  return function routes(app: FastifyInstance) {
    // All file routes require a valid access token.
    app.addHook('preHandler', authenticate);

    // ─── POST /files ──────────────────────────────────────────────────────────
    // Upload a file via multipart/form-data.
    // Field name must be "file".
    app.post('/', async (request, reply) => {
      const data = await request.file();
      if (!data) {
        throw badRequest('NO_FILE', 'Request must include a file field');
      }

      const file = await service.upload(request.userId, {
        filename: data.filename,
        mimetype: data.mimetype,
        file: data.file,
      });
      return reply.status(201).send({ data: file });
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
