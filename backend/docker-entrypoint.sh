#!/bin/sh
set -e

mkdir -p uploads

echo "Starting server..."
node dist/index.js
