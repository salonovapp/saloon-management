#!/bin/bash

# Docker Development Startup Script
# Run this script to build, initialize, and start the Docker environment.

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
        echo -e "${RED}✗ Docker Compose is not installed. Please install the Docker Compose plugin.${NC}"
        exit 1
    fi
}

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Saloon Management - Docker Setup Script                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker found${NC}"
compose version >/dev/null
echo -e "${GREEN}✓ Docker Compose found${NC}"
echo ""

echo -e "${YELLOW}[1/5] Creating directories...${NC}"
mkdir -p storage/docker/logs/php storage/docker/logs/nginx docker/mysql docker/nginx/conf.d docker/nginx/ssl
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

echo -e "${YELLOW}[2/5] Setting up environment file...${NC}"
if [ ! -f .env ]; then
    cp .env.docker.example .env
    echo -e "${GREEN}✓ Created .env from .env.docker.example${NC}"
else
    echo -e "${YELLOW}⚠ .env already exists; keeping current values${NC}"
fi
echo ""

echo -e "${YELLOW}[3/5] Building Docker images...${NC}"
compose build
echo -e "${GREEN}✓ Docker images built${NC}"
echo ""

echo -e "${YELLOW}[4/5] Starting containers...${NC}"
compose up -d
echo -e "${GREEN}✓ Containers started${NC}"
echo ""

echo -e "${YELLOW}[5/5] Verifying Laravel application...${NC}"
compose exec -T app php artisan migrate:status >/dev/null
echo -e "${GREEN}✓ Laravel is initialized${NC}"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Setup Complete! 🎉                                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "📍 Access your services at:"
echo -e "   ${YELLOW}Application:${NC}     http://localhost"
echo -e "   ${YELLOW}Mailpit (Email):${NC}  http://localhost:8025"
echo -e "   ${YELLOW}PhpMyAdmin (DB):${NC}  http://localhost:8080"
echo ""
echo "📖 View logs with:"
echo "   docker compose logs -f app"
echo ""
echo "🛑 Stop all containers:"
echo "   docker compose stop"
echo ""
echo "🗑️  Clean up everything:"
echo "   docker compose down -v"
