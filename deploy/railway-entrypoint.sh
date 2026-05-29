#!/bin/sh
set -e

export PATH="/app/node_modules/.bin:$PATH"

echo "Running database migrations..."
prisma migrate deploy 2>/dev/null || prisma migrate dev --name init --skip-generate

echo "Seeding database..."
prisma db seed 2>/dev/null || echo "Seed skipped (already exists)"

echo "Starting app..."
exec node server.js
