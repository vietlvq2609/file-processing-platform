import { Redis } from 'ioredis';

import type { WsManager } from './WsManager.js';

export async function startRedisSubscriber(redisUrl: string, manager: WsManager): Promise<void> {
  // Dedicated subscriber connection — cannot share with BullMQ connection
  // because a Redis connection in subscribe mode can only run subscribe commands.
  const subscriber = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });

  await subscriber.connect();

  // Use pattern subscribe to catch all job channels in one subscription
  await subscriber.psubscribe('job:*');

  subscriber.on('pmessage', (_pattern: string, channel: string, message: string) => {
    // channel format: job:<eventType>:<jobId>
    const parts = channel.split(':');
    if (parts.length < 3) return;

    const eventType = parts[1]; // 'progress' | 'completed' | 'failed'
    const jobId = parts.slice(2).join(':'); // remainder is the jobId (UUID, no colons, but safe)

    let payload: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(message);
      if (typeof parsed !== 'object' || parsed === null) return;
      payload = parsed as Record<string, unknown>;
    } catch {
      return;
    }

    const event = { type: `job:${eventType}`, jobId, ...payload };
    manager.broadcast(jobId, event);
  });
}
