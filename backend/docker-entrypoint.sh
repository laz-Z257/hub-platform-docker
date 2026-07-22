#!/bin/sh
set -e

mkdir -p uploads

echo "Running database migrations..."
node dist/db/migrate.js

echo "Running seed..."
node dist/db/seed.js

echo "Starting server..."
node dist/index.js
