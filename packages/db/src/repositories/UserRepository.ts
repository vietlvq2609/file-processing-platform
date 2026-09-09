import { eq } from 'drizzle-orm';

import type { DrizzleClient } from '../client.js';
import type { User } from '../schema/index.js';
import { users } from '../schema/index.js';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: { email: string; passwordHash: string }): Promise<User>;
  setRefreshTokenHash(userId: string, hash: string | null): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}

export class UserRepository implements IUserRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return user ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return user ?? null;
  }

  async create(data: { email: string; passwordHash: string }): Promise<User> {
    const [user] = await this.db.insert(users).values(data).returning();
    return user;
  }

  async setRefreshTokenHash(userId: string, hash: string | null): Promise<void> {
    await this.db
      .update(users)
      .set({ refreshTokenHash: hash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}
