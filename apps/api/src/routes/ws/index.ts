import type { WebSocket } from '@fastify/websocket';
import type { WsClientMessage } from '@fpp/types';
import type { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';

import type { WsManager } from '../../ws/WsManager.js';

export function wsRoutes(manager: WsManager, jwtAccessSecret: string) {
  return function routes(app: FastifyInstance) {
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
        const payload = jwt.verify(token, jwtAccessSecret) as { sub: string };
        userId = payload.sub;
      } catch {
        socket.close(4001, 'Invalid or expired token');
        return;
      }

      manager.add(userId, socket);

      // ── Message handler ───────────────────────────────────────────────────
      socket.on('message', (raw: Buffer) => {
        let msg: WsClientMessage;
        try {
          msg = JSON.parse(raw.toString()) as WsClientMessage;
        } catch {
          return;
        }

        if (msg.type === 'subscribe') {
          manager.subscribe(socket, msg.jobId);
        } else if (msg.type === 'unsubscribe') {
          manager.unsubscribe(socket, msg.jobId);
        }
      });

      // ── Cleanup ───────────────────────────────────────────────────────────
      socket.on('close', () => {
        manager.remove(socket);
      });
    });
  };
}
