#!/bin/sh
set -e

echo "Running database migrations..."
node /app/packages/db/dist/migrate.js

echo "Starting API server..."
exec node /app/apps/api/dist/index.js
