#!/bin/sh
export PORT=3000

echo "==> Running migrations..."
if [ ! -f prisma/migrations/migration_lock.toml ] || grep -q sqlite prisma/migrations/migration_lock.toml 2>/dev/null; then
  rm -rf prisma/migrations
  mkdir -p prisma/migrations
  npx prisma migrate dev --name init --skip-generate
fi

npx prisma migrate deploy 2>/dev/null || true

echo "==> Seeding..."
npx prisma db seed 2>/dev/null || true

echo "==> Starting app on port ${PORT}..."
exec node server.js
