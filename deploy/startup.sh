#!/bin/sh
export PORT=3000

# Start app in background first so Railway health check passes
echo "==> Starting app on port ${PORT}..."
node server.js &
APP_PID=$!

# Give the app a moment to bind to the port
sleep 2

# Then run migrations and seed
echo "==> Running migrations..."
if [ ! -f prisma/migrations/migration_lock.toml ] || grep -q sqlite prisma/migrations/migration_lock.toml 2>/dev/null; then
  rm -rf prisma/migrations
  mkdir -p prisma/migrations
  npx prisma migrate dev --name init --skip-generate 2>/dev/null || true
fi
npx prisma migrate deploy 2>/dev/null || true

echo "==> Seeding..."
npx prisma db seed 2>/dev/null || true

echo "==> Ready!"

# Wait for the app process
wait $APP_PID
