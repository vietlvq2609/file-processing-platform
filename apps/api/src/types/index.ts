// Augments FastifyRequest so any route can read request.userId
// populated by the extractUserId hook in server.ts.
declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}

export {};
