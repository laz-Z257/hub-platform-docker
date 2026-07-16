#!/bin/sh
set -e

mkdir -p uploads

echo "Running database migrations..."
npx drizzle-kit generate --force
npx drizzle-kit migrate

echo "Starting server..."
node dist/index.js
