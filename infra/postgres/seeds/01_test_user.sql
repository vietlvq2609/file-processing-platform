-- Dev seed: one mock user for local development (auth is skipped).
-- Run after migrations against the local database.
--
--   pnpm db:seed
--   # or manually:
--   docker exec -i fpp-postgres psql -U postgres -d file-processing-platform-db < infra/postgres/seeds/01_test_user.sql
--
-- Then set this header in every Postman request:
--   X-User-Id: 00000000-0000-0000-0000-000000000001

-- 1. Ensure the mock user exists.
INSERT INTO users (id, email, password_hash)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@example.com',
  'not-used-auth-is-skipped'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Reassign any existing files to the mock user.
UPDATE files
SET user_id = '00000000-0000-0000-0000-000000000001'
WHERE user_id != '00000000-0000-0000-0000-000000000001';

-- 3. Reassign any existing jobs to the mock user.
UPDATE jobs
SET user_id = '00000000-0000-0000-0000-000000000001'
WHERE user_id != '00000000-0000-0000-0000-000000000001';
