-- One-off retroactive cleanup: purge guest rows accumulated before this migration.
-- Runs before the FK drop below so the existing cascade still removes their
-- files/jobs/api_keys automatically.
DELETE FROM "users" WHERE "is_guest" = true;
--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_user_id_users_id_fk";
