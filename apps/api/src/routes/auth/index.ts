import type { FastifyInstance } from 'fastify';
import type { AuthService } from '../../services/AuthService.js';
import { authenticate } from '../../plugins/authenticate.js';
import { registerSchema, loginSchema } from './schemas.js';

const REFRESH_COOKIE = 'refreshToken';
/** 7 days in seconds — must match the refresh token JWT TTL in AuthService. */
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export function authRoutes(service: AuthService) {
  return async function routes(app: FastifyInstance) {
    const isProduction = process.env.NODE_ENV === 'production';

    // The cookie path is scoped to /api/auth so it is only sent on auth endpoints.
    const refreshCookieOpts = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      path: '/api/auth',
      maxAge: REFRESH_COOKIE_MAX_AGE,
    };

    // ─── POST /auth/register ────────────────────────────────────────────────
    // Creates a new user account and immediately issues tokens.
    app.post<{ Body: { email: string; password: string } }>(
      '/register',
      { schema: registerSchema },
      async (request, reply) => {
        const { email, password } = request.body;
        const { user, accessToken, refreshToken } = await service.register(email, password);
        reply.setCookie(REFRESH_COOKIE, refreshToken, refreshCookieOpts);
        return reply.status(201).send({ data: user, accessToken });
      }
    );

    // ─── POST /auth/login ────────────────────────────────────────────────────
    // Authenticates an existing user and issues new tokens.
    app.post<{ Body: { email: string; password: string } }>(
      '/login',
      { schema: loginSchema },
      async (request, reply) => {
        const { email, password } = request.body;
        const { user, accessToken, refreshToken } = await service.login(email, password);
        reply.setCookie(REFRESH_COOKIE, refreshToken, refreshCookieOpts);
        return reply.send({ data: user, accessToken });
      }
    );

    // ─── POST /auth/refresh ──────────────────────────────────────────────────
    // Issues a new access token using the refresh token from the httpOnly cookie.
    // No request body required — the cookie is sent automatically by the browser.
    app.post('/refresh', async (request, reply) => {
      const token = request.cookies[REFRESH_COOKIE];
      if (!token) {
        return reply.status(401).send({
          error: { code: 'MISSING_REFRESH_TOKEN', message: 'Refresh token cookie is missing' },
        });
      }
      const { accessToken } = await service.refresh(token);
      return reply.send({ accessToken });
    });

    // ─── POST /auth/logout ───────────────────────────────────────────────────
    // Revokes the current session. Requires a valid access token.
    app.post(
      '/logout',
      { preHandler: [authenticate] },
      async (request, reply) => {
        await service.logout(request.userId);
        reply.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
        return reply.status(204).send();
      }
    );

    // ─── GET /auth/me ────────────────────────────────────────────────────────
    // Returns the authenticated user's profile. Requires a valid access token.
    app.get(
      '/me',
      { preHandler: [authenticate] },
      async (request, reply) => {
        const user = await service.me(request.userId);
        return reply.send({ data: user });
      }
    );
  };
}
