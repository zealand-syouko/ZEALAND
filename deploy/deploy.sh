#!/bin/bash
set -e

echo "=== Token Relay Deployment ==="

if [ ! -f .env.production ]; then
    echo "ERROR: .env.production not found."
    echo "Run: cp .env.production.example .env.production"
    echo "Edit .env.production with your secrets, then re-run."
    exit 1
fi

export $(grep -v '^#' .env.production | xargs)

echo "1/4 Pulling images..."
docker compose -f docker-compose.prod.yml pull

echo "2/4 Building app..."
docker compose -f docker-compose.prod.yml build app

echo "3/4 Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo "4/4 Waiting for healthy..."
sleep 10
docker compose -f docker-compose.prod.yml ps

echo ""
echo "=== Deployed ==="
echo "App:  http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP')"
echo ""
echo "First steps:"
echo "  1. Visit the URL above and log in with the admin credentials"
echo "  2. Configure at least one LLM Provider (API Key)"
echo "  3. Set pricing in Admin > Pricing"
echo "  4. Share the registration link with your users"
