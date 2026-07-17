#!/bin/sh
set -e

mkdir -p uploads

echo "Running database migrations..."
for f in /app/drizzle/*.sql; do
  echo "Applying: $(basename $f)"
  psql "$DATABASE_URL" -f "$f" || echo "Warning: $(basename $f) may have already been applied"
done

echo "Running seed..."
node dist/db/seed.js

echo "Starting server..."
node dist/index.js
