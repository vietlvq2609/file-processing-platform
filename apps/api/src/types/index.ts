// Augments FastifyRequest so any route can read request.userId
// populated by the extractUserId hook in server.ts.
declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
    /** Set by the authenticate plugin; 'guest' for stateless guest sessions, undefined otherwise. */
    role?: 'guest';
  }
}

export {};
