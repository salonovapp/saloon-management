#!/usr/bin/env bash

# Docker Development Startup Script for Saloon Management.
# It builds the Laravel/PHP image, builds React assets, starts PostgreSQL/Redis/Nginx,
# and runs Laravel migrations inside the container.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

compose() {
    if docker compose version >/dev/null 2>&1; then
        docker compose "$@"
    elif command -v docker-compose >/dev/null 2>&1; then
        docker-compose "$@"
    else
        echo -e "${RED}✗ Docker Compose is not installed.${NC}"
        exit 1
    fi
}

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Saloon Management - Docker Setup                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker found${NC}"
compose version >/dev/null
echo -e "${GREEN}✓ Docker Compose found${NC}"

if [ ! -f .env ]; then
    cp .env.docker.example .env
    echo -e "${GREEN}✓ Created .env from .env.docker.example${NC}"
else
    echo -e "${YELLOW}⚠ .env already exists; leaving it unchanged${NC}"
fi

mkdir -p storage/app/public storage/framework/cache/data storage/framework/sessions storage/framework/testing storage/framework/views storage/logs

echo -e "${YELLOW}Building containers...${NC}"
compose build

echo -e "${YELLOW}Starting containers...${NC}"
compose up -d

echo -e "${YELLOW}Waiting for Laravel container to become healthy...${NC}"
for _ in $(seq 1 60); do
    status="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' saloon_app 2>/dev/null || true)"
    if [ "$status" = "healthy" ]; then
        break
    fi
    sleep 2
done

if [ "${status:-unknown}" != "healthy" ]; then
    echo -e "${RED}✗ saloon_app did not become healthy. Check logs with: docker compose logs app${NC}"
    exit 1
fi

compose exec -T app php artisan storage:link --force || true
compose exec -T app php artisan optimize:clear

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Access your services at:"
echo -e "  ${YELLOW}Application:${NC} http://localhost"
echo -e "  ${YELLOW}API health:${NC}  http://localhost/health"
echo -e "  ${YELLOW}Mailpit:${NC}     http://localhost:8025"
echo -e "  ${YELLOW}pgAdmin:${NC}     http://localhost:5050"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f app"
echo "  docker compose exec app php artisan migrate:fresh --seed"
echo "  docker compose down"
echo "  docker compose down -v  # removes database volumes"
