import { createHash } from 'node:crypto';

import type { IUserRepository } from '@fpp/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { conflict, notFound, unauthorized } from '../utils/errors.js';

/** Public-safe user shape — password and refresh token hash are never included. */
export interface PublicUser {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthServiceConfig {
  accessSecret: string;
  refreshSecret: string;
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
  bcryptRounds: number;
}

function toPublicUser(user: {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}): PublicUser {
  return { id: user.id, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt };
}

/** SHA-256 hash of a token for storage. Faster than bcrypt and sufficient for random JWT strings. */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export class AuthService {
  constructor(
    private readonly repo: IUserRepository,
    private readonly cfg: AuthServiceConfig
  ) {}

  private signAccessToken(userId: string): string {
    return jwt.sign({ sub: userId }, this.cfg.accessSecret, {
      expiresIn: this.cfg.accessTtlSeconds,
    });
  }

  private signRefreshToken(userId: string): string {
    return jwt.sign({ sub: userId }, this.cfg.refreshSecret, {
      expiresIn: this.cfg.refreshTtlSeconds,
    });
  }

  // ─── Public methods ────────────────────────────────────────────────────────

  async register(
    email: string,
    password: string
  ): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> {
    const existing = await this.repo.findByEmail(email);
    if (existing) {
      throw conflict('EMAIL_TAKEN', 'An account with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(password, this.cfg.bcryptRounds);
    const user = await this.repo.create({ email, passwordHash });

    const accessToken = this.signAccessToken(user.id);
    const refreshToken = this.signRefreshToken(user.id);
    await this.repo.setRefreshTokenHash(user.id, hashToken(refreshToken));

    return { user: toPublicUser(user), accessToken, refreshToken };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> {
    const user = await this.repo.findByEmail(email);
    if (!user) {
      // Use the same message for missing user and wrong password to prevent user enumeration.
      throw unauthorized('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw unauthorized('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const accessToken = this.signAccessToken(user.id);
    const refreshToken = this.signRefreshToken(user.id);
    // Replacing the stored hash invalidates any previous session (single active session per user).
    await this.repo.setRefreshTokenHash(user.id, hashToken(refreshToken));

    return { user: toPublicUser(user), accessToken, refreshToken };
  }

  async refresh(token: string): Promise<{ accessToken: string }> {
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(token, this.cfg.refreshSecret) as jwt.JwtPayload;
    } catch {
      throw unauthorized('INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
    }

    const userId = payload.sub;
    if (!userId) {
      throw unauthorized('INVALID_REFRESH_TOKEN', 'Refresh token payload is malformed');
    }

    const user = await this.repo.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw unauthorized('INVALID_REFRESH_TOKEN', 'Session not found — please log in again');
    }

    if (user.refreshTokenHash !== hashToken(token)) {
      // Token reuse detected (possible token theft). Invalidate the session immediately.
      await this.repo.setRefreshTokenHash(userId, null);
      throw unauthorized('INVALID_REFRESH_TOKEN', 'Refresh token has already been used');
    }

    return { accessToken: this.signAccessToken(userId) };
  }

  async logout(userId: string): Promise<void> {
    await this.repo.setRefreshTokenHash(userId, null);
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw notFound('USER_NOT_FOUND', 'User not found');
    }
    return toPublicUser(user);
  }
}
