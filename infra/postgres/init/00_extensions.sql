-- This file runs once on first container start (before drizzle-kit migrations).
-- Use it only for extensions or roles that migrations cannot create themselves.

-- Enable the pgcrypto extension for gen_random_uuid() (used as fallback).
CREATE EXTENSION IF NOT EXISTS pgcrypto;
