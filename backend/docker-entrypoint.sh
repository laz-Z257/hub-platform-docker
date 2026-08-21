#!/bin/sh
set -e

mkdir -p uploads

echo "Running database migrations..."
node dist/db/migrate.js

echo "Running seed..."
node dist/db/seed.js

# Iniciar cron daemon (lee /etc/cron.d/gc-uploads instalado en build)
crond -b

echo "Starting server..."
node dist/index.js
