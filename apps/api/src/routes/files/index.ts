import type { FastifyInstance } from 'fastify';
import type { FileService } from '../../services/FileService.js';
import { listFilesSchema, fileByIdSchema } from './schemas.js';
import { badRequest } from '../../utils/errors.js';

// Auth is skipped for now.
// Pass X-User-Id header in Postman to identify the caller.
// The UUID must match a row in the users table.
// Fallback: the seeded dev user (see infra/postgres/seeds/01_test_user.sql).
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

function extractUserId(headers: Record<string, string | string[] | undefined>): string {
  const header = headers['x-user-id'];
  const value = Array.isArray(header) ? header[0] : header;
  return value ?? DEV_USER_ID;
}

// fileRoutes is a factory: it closes over the service so no global state is needed.
export function fileRoutes(service: FileService) {
  return async function routes(app: FastifyInstance) {
    // ─── POST /files ──────────────────────────────────────────────────────────
    // Upload a file via multipart/form-data.
    // Field name must be "file".
    app.post('/', async (request, reply) => {
      const userId = extractUserId(request.headers);
      const data = await request.file();
      if (!data) {
        throw badRequest('NO_FILE', 'Request must include a file field');
      }

      const file = await service.upload(userId, data);
      return reply.status(201).send({ data: file });
    });

    // ─── GET /files ───────────────────────────────────────────────────────────
    // List all non-deleted files for the current user.
    // Query params: page, limit, search
    app.get('/', { schema: listFilesSchema }, async (request, reply) => {
      const userId = extractUserId(request.headers);
      const query = request.query as { page: number; limit: number; search?: string };
      const result = await service.list(userId, query);
      return reply.send(result);
    });

    // ─── GET /files/:id ───────────────────────────────────────────────────────
    // Fetch metadata for a single file.
    app.get('/:id', { schema: fileByIdSchema }, async (request, reply) => {
      const userId = extractUserId(request.headers);
      const { id } = request.params as { id: string };
      const file = await service.findById(userId, id);
      return reply.send({ data: file });
    });

    // ─── DELETE /files/:id ────────────────────────────────────────────────────
    // Soft-delete a file (sets status = 'deleted', does not remove from disk).
    app.delete('/:id', { schema: fileByIdSchema }, async (request, reply) => {
      const userId = extractUserId(request.headers);
      const { id } = request.params as { id: string };
      await service.delete(userId, id);
      return reply.status(204).send();
    });

    // ─── GET /files/:id/download ──────────────────────────────────────────────
    // Stream the file back to the client with correct Content-Type.
    app.get('/:id/download', { schema: fileByIdSchema }, async (request, reply) => {
      const userId = extractUserId(request.headers);
      const { id } = request.params as { id: string };
      const { stream, file } = await service.getDownloadStream(userId, id);

      return reply
        .header('Content-Type', file.mimeType)
        .header('Content-Disposition', `attachment; filename="${file.originalName}"`)
        .header('Content-Length', String(file.size))
        .send(stream);
    });
  };
}
