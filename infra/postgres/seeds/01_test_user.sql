-- Dev seed: one test user for local development.
-- Credentials: test@example.com / password123
-- Run after migrations against the local database.
--
--   pnpm db:seed
--   # or manually:
--   docker exec -i fpp-postgres psql -U postgres -d file-processing-platform-db < infra/postgres/seeds/01_test_user.sql

-- 1. Upsert the test user with a real bcrypt hash for password "password123".
INSERT INTO users (id, email, password_hash)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@example.com',
  '$2b$12$k.cY/mnGz3WVb7vx.eCBq.kFtVm9UK1XU2NtTXJWq1sy5kLQ.pF5.'
)
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      password_hash = EXCLUDED.password_hash;

-- 2. Reassign any existing files to the mock user.
UPDATE files
SET user_id = '00000000-0000-0000-0000-000000000001'
WHERE user_id != '00000000-0000-0000-0000-000000000001';

-- 3. Reassign any existing jobs to the mock user.
UPDATE jobs
SET user_id = '00000000-0000-0000-0000-000000000001'
WHERE user_id != '00000000-0000-0000-0000-000000000001';
