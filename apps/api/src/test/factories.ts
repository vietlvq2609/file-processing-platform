import type { File as DbFile, Job as DbJob, User } from '@fpp/db';

export function buildUser(overrides?: Partial<User>): User {
  return {
    id: crypto.randomUUID(),
    email: 'user@example.com',
    passwordHash: '$2b$04$placeholder.hash.for.testing',
    refreshTokenHash: null,
    isGuest: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

export function buildFile(overrides?: Partial<DbFile>): DbFile {
  return {
    id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    originalName: 'test.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    storagePath: 'user-id/file-uuid.pdf',
    status: 'ready',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

export function buildJob(overrides?: Partial<DbJob>): DbJob {
  return {
    id: crypto.randomUUID(),
    fileId: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    type: 'default',
    status: 'pending',
    progress: 0,
    outputPath: null,
    errorMessage: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}
