-- Dev seed: one test user for Postman testing (auth is skipped).
-- Run once against the local database after migrations.
--
--   docker exec -i fpp-postgres psql -U postgres -d file-processing-platform-db < infra/postgres/seeds/01_test_user.sql
--
-- Then set this header in every Postman request:
--   X-User-Id: 00000000-0000-0000-0000-000000000001

INSERT INTO users (id, email, password_hash)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@example.com',
  'not-used-auth-is-skipped'
)
ON CONFLICT (id) DO NOTHING;
