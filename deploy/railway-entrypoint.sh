#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init --skip-generate

echo "Seeding database..."
npx prisma db seed 2>/dev/null || echo "Seed skipped (already exists)"

echo "Starting app..."
exec node server.js
