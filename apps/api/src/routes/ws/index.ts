import type { FastifyInstance } from 'fastify';
import type { WebSocket } from '@fastify/websocket';
import jwt from 'jsonwebtoken';
import { wsManager } from '../../ws/WsManager.js';
import { config } from '../../config.js';
import type { WsClientMessage } from '@fpp/types';

export function wsRoutes() {
  return async function routes(app: FastifyInstance) {
    // GET /ws?token=<accessToken>
    // The token is passed as a query param because browsers cannot set
    // Authorization headers on native WebSocket connections.
    app.get('/', { websocket: true }, (socket: WebSocket, request) => {
      // ── Authenticate ─────────────────────────────────────────────────────
      const { token } = request.query as { token?: string };
      if (!token) {
        socket.close(4001, 'Missing token');
        return;
      }

      let userId: string;
      try {
        const payload = jwt.verify(token, config.jwt.accessSecret) as { sub: string };
        userId = payload.sub;
      } catch {
        socket.close(4001, 'Invalid or expired token');
        return;
      }

      wsManager.add(userId, socket);

      // ── Message handler ───────────────────────────────────────────────────
      socket.on('message', (raw: Buffer) => {
        let msg: WsClientMessage;
        try {
          msg = JSON.parse(raw.toString()) as WsClientMessage;
        } catch {
          return;
        }

        if (msg.type === 'subscribe') {
          wsManager.subscribe(socket, msg.jobId);
        } else if (msg.type === 'unsubscribe') {
          wsManager.unsubscribe(socket, msg.jobId);
        }
      });

      // ── Cleanup ───────────────────────────────────────────────────────────
      socket.on('close', () => {
        wsManager.remove(socket);
      });
    });
  };
}
