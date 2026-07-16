#!/bin/sh
set -e

mkdir -p uploads

echo "Running database migrations..."
npx drizzle-kit push --force

echo "Starting server..."
node dist/index.js
