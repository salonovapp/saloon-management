#!/bin/bash

# Docker Development Startup Script
# Run this script to quickly setup and start the Docker environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Saloon Management - Docker Setup Script                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker found${NC}"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker Compose found${NC}"
echo ""

# Step 1: Create necessary directories
echo -e "${YELLOW}[1/8] Creating directories...${NC}"
mkdir -p storage/docker/logs/php
mkdir -p storage/docker/logs/nginx
mkdir -p docker/mysql
mkdir -p docker/nginx/conf.d
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Step 2: Copy environment files
echo -e "${YELLOW}[2/8] Setting up environment files...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env from .env.example${NC}"
else
    echo -e "${YELLOW}⚠ .env already exists${NC}"
fi

if [ ! -f .env.docker ]; then
    cp .env.docker.example .env.docker
    echo -e "${GREEN}✓ Created .env.docker from .env.docker.example${NC}"
else
    echo -e "${YELLOW}⚠ .env.docker already exists${NC}"
fi
echo ""

# Step 3: Create MySQL init script if doesn't exist
echo -e "${YELLOW}[3/8] Setting up MySQL initialization...${NC}"
if [ ! -f docker/mysql/init.sql ]; then
    cat > docker/mysql/init.sql << 'EOF'
-- MySQL Database Initialization Script
CREATE DATABASE IF NOT EXISTS saloon_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'saloon_user'@'%' IDENTIFIED BY 'saloon_password';
GRANT ALL PRIVILEGES ON saloon_db.* TO 'saloon_user'@'%' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EOF
    echo -e "${GREEN}✓ MySQL init script created${NC}"
else
    echo -e "${YELLOW}⚠ MySQL init script already exists${NC}"
fi
echo ""

# Step 4: Build Docker images
echo -e "${YELLOW}[4/8] Building Docker images (this may take a few minutes)...${NC}"
docker-compose build
echo -e "${GREEN}✓ Docker images built${NC}"
echo ""

# Step 5: Start containers
echo -e "${YELLOW}[5/8] Starting containers...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Containers started${NC}"
echo ""

# Wait for services to be ready
echo -e "${YELLOW}[6/8] Waiting for services to be ready...${NC}"
sleep 10
echo -e "${GREEN}✓ Services are ready${NC}"
echo ""

# Step 6: Generate app key
echo -e "${YELLOW}[7/8] Initializing Laravel application...${NC}"
docker-compose exec -T app php artisan key:generate
docker-compose exec -T app php artisan migrate
echo -e "${GREEN}✓ Laravel initialized${NC}"
echo ""

# Step 7: Install npm dependencies
echo -e "${YELLOW}[8/8] Installing frontend dependencies...${NC}"
docker-compose exec -T app npm install
docker-compose exec -T app npm run build
echo -e "${GREEN}✓ Frontend built${NC}"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Setup Complete! 🎉                                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Your application is now running!${NC}"
echo ""
echo "📍 Access your services at:"
echo -e "   ${YELLOW}Application:${NC}     http://localhost"
echo -e "   ${YELLOW}Mailpit (Email):${NC}  http://localhost:8025"
echo -e "   ${YELLOW}PhpMyAdmin (DB):${NC}  http://localhost:8080"
echo ""
echo "📖 View logs with:"
echo "   docker-compose logs -f app"
echo ""
echo "🛑 To stop all containers:"
echo "   docker-compose stop"
echo ""
echo "🗑️  To clean up everything:"
echo "   docker-compose down -v"
echo ""
