import { Redis } from 'ioredis';
import { config } from '../config.js';
import { wsManager } from './WsManager.js';

// Dedicated subscriber connection — cannot share with BullMQ connection
// because a Redis connection in subscribe mode can only run subscribe commands.
const subscriber = new Redis(config.redis.url, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

/**
 * Subscribe to all job event channels on Redis Pub/Sub and forward
 * each message to the WebSocket clients that are subscribed to that job.
 *
 * Channel naming convention (matches the Worker):
 *   job:progress:<jobId>
 *   job:completed:<jobId>
 *   job:failed:<jobId>
 */
export async function startRedisSubscriber(): Promise<void> {
  await subscriber.connect();

  // Use pattern subscribe to catch all job channels in one subscription
  await subscriber.psubscribe('job:*');

  subscriber.on('pmessage', (_pattern: string, channel: string, message: string) => {
    // channel format: job:<eventType>:<jobId>
    const parts = channel.split(':');
    if (parts.length < 3) return;

    const eventType = parts[1]; // 'progress' | 'completed' | 'failed'
    const jobId = parts.slice(2).join(':'); // remainder is the jobId (UUID, no colons, but safe)

    let payload: object;
    try {
      payload = JSON.parse(message);
    } catch {
      return;
    }

    const event = { type: `job:${eventType}`, jobId, ...payload };
    wsManager.broadcast(jobId, event);
  });
}
