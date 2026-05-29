#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until node -e "require('net').connect({host:'db',port:5432},()=>process.exit(0))" 2>/dev/null; do
  sleep 2
done

echo "Running database migrations..."
npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init --skip-generate

echo "Seeding database..."
npx prisma db seed 2>/dev/null || echo "Seed skipped"

echo "Starting app..."
exec node server.js
