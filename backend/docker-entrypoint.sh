#!/bin/sh
set -e

mkdir -p uploads

echo "Running database migrations..."
npx drizzle-kit push --force 2>/dev/null || echo "Migrations skipped (already applied or error)"

echo "Starting server..."
node dist/index.js
