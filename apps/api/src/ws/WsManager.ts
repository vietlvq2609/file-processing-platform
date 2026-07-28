import type { WebSocket } from '@fastify/websocket';

/**
 * Tracks active WebSocket connections keyed by userId,
 * and per-connection job subscriptions.
 *
 * A single user may have multiple browser tabs open (multiple sockets).
 * A single socket may subscribe to multiple jobs.
 */
export class WsManager {
  // userId → Set of sockets
  private readonly byUser = new Map<string, Set<WebSocket>>();
  // socket → Set of subscribed jobIds
  private readonly subscriptions = new Map<WebSocket, Set<string>>();

  // ── Connection lifecycle ──────────────────────────────────────────────────

  add(userId: string, socket: WebSocket): void {
    if (!this.byUser.has(userId)) {
      this.byUser.set(userId, new Set());
    }
    this.byUser.get(userId)!.add(socket);
    this.subscriptions.set(socket, new Set());
  }

  remove(socket: WebSocket): void {
    for (const [userId, sockets] of this.byUser) {
      if (sockets.has(socket)) {
        sockets.delete(socket);
        if (sockets.size === 0) this.byUser.delete(userId);
        break;
      }
    }
    this.subscriptions.delete(socket);
  }

  // ── Subscription management ───────────────────────────────────────────────

  subscribe(socket: WebSocket, jobId: string): void {
    this.subscriptions.get(socket)?.add(jobId);
  }

  unsubscribe(socket: WebSocket, jobId: string): void {
    this.subscriptions.get(socket)?.delete(jobId);
  }

  // ── Event broadcasting ────────────────────────────────────────────────────

  /**
   * Send a serialised event to every socket that is subscribed to `jobId`.
   */
  broadcast(jobId: string, event: object): void {
    const payload = JSON.stringify(event);
    for (const [socket, jobIds] of this.subscriptions) {
      if (jobIds.has(jobId) && socket.readyState === socket.OPEN) {
        socket.send(payload);
      }
    }
  }
}

export const wsManager = new WsManager();
