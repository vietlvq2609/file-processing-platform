import type { IUserRepository, User } from '@fpp/db';

export class InMemoryUserRepository implements IUserRepository {
  private readonly users = new Map<string, User>();

  findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return Promise.resolve(user);
    }
    return Promise.resolve(null);
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }

  create(data: { email: string; passwordHash: string }): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email: data.email,
      passwordHash: data.passwordHash,
      refreshTokenHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return Promise.resolve(user);
  }

  setRefreshTokenHash(userId: string, hash: string | null): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, { ...user, refreshTokenHash: hash, updatedAt: new Date() });
    }
    return Promise.resolve();
  }

  updatePassword(userId: string, passwordHash: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, { ...user, passwordHash, updatedAt: new Date() });
    }
    return Promise.resolve();
  }
}
