import type { User } from '../domain.js';

// ─── POST /auth/register ─────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  data: User;
  accessToken: string;
}

// ─── POST /auth/login ────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: User;
  accessToken: string;
}

// ─── POST /auth/refresh ──────────────────────────────────────────────────────
// No request body — the refresh token is sent as an httpOnly cookie.

export interface RefreshResponse {
  accessToken: string;
}

// ─── POST /auth/logout ───────────────────────────────────────────────────────
// No request body. No meaningful response body — server responds 204.

// ─── GET /auth/me ────────────────────────────────────────────────────────────

export interface MeResponse {
  data: User;
}
