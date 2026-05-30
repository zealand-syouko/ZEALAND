#!/bin/sh
export PORT=${PORT:-3000}
BIN="./node_modules/.bin"

echo "==> Running migrations..."
$BIN/prisma migrate deploy 2>/dev/null || true

echo "==> Seeding..."
$BIN/prisma db seed 2>/dev/null || true

echo "==> Starting app on port ${PORT}..."
exec $BIN/next start -p ${PORT}
