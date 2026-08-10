import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InMemoryUserRepository } from '../test/stubs/InMemoryUserRepository.js';
import { AuthService, type AuthServiceConfig } from './AuthService.js';

const testConfig: AuthServiceConfig = {
  accessSecret: 'test-access-secret-at-least-32-characters-long',
  refreshSecret: 'test-refresh-secret-at-least-32-characters-long',
  accessTtlSeconds: 3600,
  refreshTtlSeconds: 86400,
  bcryptRounds: 4,
};

describe('AuthService', () => {
  let repo: InMemoryUserRepository;
  let service: AuthService;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    service = new AuthService(repo, testConfig);
  });

  describe('register()', () => {
    it('creates a user and returns tokens', async () => {
      const result = await service.register('alice@example.com', 'secret123');

      expect(result.user.email).toBe('alice@example.com');
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it('throws ConflictError when email already exists', async () => {
      await service.register('alice@example.com', 'secret123');

      await expect(service.register('alice@example.com', 'other')).rejects.toMatchObject({
        statusCode: 409,
        code: 'EMAIL_TAKEN',
      });
    });
  });

  describe('login()', () => {
    beforeEach(async () => {
      await service.register('alice@example.com', 'correct-password');
    });

    it('returns tokens on valid credentials', async () => {
      const result = await service.login('alice@example.com', 'correct-password');

      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it('throws UnauthorizedError on wrong password', async () => {
      await expect(service.login('alice@example.com', 'wrong')).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      });
    });

    it('throws UnauthorizedError on unknown email', async () => {
      await expect(service.login('nobody@example.com', 'password')).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      });
    });
  });

  describe('refresh()', () => {
    it('returns a new access token on a valid refresh token', async () => {
      const { refreshToken } = await service.register('alice@example.com', 'secret123');

      const result = await service.refresh(refreshToken);

      expect(result.accessToken).toBeTruthy();
    });

    it('throws UnauthorizedError on reuse detection (hash mismatch)', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

      const { refreshToken: staleToken } = await service.register('alice@example.com', 'secret123');

      // Advance by 1 second so the next JWT has a different iat, making it a distinct token
      vi.setSystemTime(new Date('2024-01-01T00:00:01Z'));
      await service.login('alice@example.com', 'secret123');

      vi.useRealTimers();

      await expect(service.refresh(staleToken)).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_REFRESH_TOKEN',
      });
    });
  });

  describe('logout()', () => {
    it('clears the refresh token hash', async () => {
      const { user } = await service.register('alice@example.com', 'secret123');

      await service.logout(user.id);

      const stored = await repo.findById(user.id);
      expect(stored?.refreshTokenHash).toBeNull();
    });
  });
});
