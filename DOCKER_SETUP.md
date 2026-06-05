# Docker Setup Guide for Saloon Management

This guide provides step-by-step instructions to set up and run the **Saloon Management** application using Docker containers. With this setup, you won't need to install PHP, Node.js, MySQL, Redis, or any other dependencies on your local machine.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Initial Setup](#initial-setup)
4. [Running the Application](#running-the-application)
5. [Common Commands](#common-commands)
6. [Accessing Services](#accessing-services)
7. [Development Workflow](#development-workflow)
8. [Troubleshooting](#troubleshooting)
9. [Additional Resources](#additional-resources)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker**: [Download and install Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Docker Compose**: Usually comes with Docker Desktop (v2.0+)
- **Git**: For cloning the repository

### Verify Installation

```bash
# Check Docker version
docker --version
# Expected: Docker version X.X.X

# Check Docker Compose version
docker compose version
# Expected: Docker Compose version vX.X.X
```

---

## Project Structure

```
saloon-management/
├── docker/
│   ├── nginx/
│   │   ├── conf.d/
│   │   │   └── default.conf          # Nginx configuration
│   │   └── ssl/                        # SSL certificates (optional)
│   └── mysql/
│       └── init.sql                    # MySQL initialization script
├── app/                                # Laravel application code
├── resources/                          # React/Frontend files
├── public/                             # Public assets
├── storage/                            # Logs and cache
├── Dockerfile                          # Docker image definition
├── docker-compose.yml                  # Docker Compose configuration
├── .env.docker.example                 # Example environment variables
├── .dockerignore                       # Files to exclude from Docker build
└── DOCKER_SETUP.md                     # This file
```

---

## Initial Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/salonovapp/saloon-management.git
cd saloon-management

# Switch to docker_container_main branch
git checkout docker_container_main
```

### Step 2: Configure Environment Variables

```bash
# Copy the Docker-ready environment file used by Compose
cp .env.docker.example .env
```

Edit `.env` to match your needs:

```bash
vim .env
# or
nano .env
```

Key variables to update:

```dotenv
APP_NAME="Saloon Management"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

# Database
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_FORWARD_PORT=3306
DB_DATABASE=saloon_db
DB_USERNAME=saloon_user
DB_PASSWORD=saloon_password

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=redis_password

# Mail (Using Mailpit for development)
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_FROM_ADDRESS=hello@example.com
```

### Step 3: Create Log Directories

```bash
# Create necessary directories for logs
mkdir -p storage/docker/logs/php
mkdir -p storage/docker/logs/nginx
mkdir -p docker/mysql
mkdir -p docker/nginx/conf.d
mkdir -p docker/nginx/ssl
```

### Step 4: Create MySQL Initialization Script

Create `docker/mysql/init.sql`:

```sql
-- This file runs automatically when MySQL container starts
CREATE DATABASE IF NOT EXISTS saloon_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON saloon_db.* TO 'saloon_user'@'%';
FLUSH PRIVILEGES;
```

### Step 5: Ensure Nginx Configuration Exists

The Nginx configuration file should already exist at `docker/nginx/conf.d/default.conf`. If not, it will be created by the Docker setup.

---

## Running the Application

### Step 1: Build Docker Images

```bash
# Build the Docker images
docker compose build
```

**Output:**
```
Building app
Building redis
Building db
Building mailpit
Building phpmyadmin
Building nginx
```

### Step 2: Start the Containers

```bash
# Start all services
docker compose up -d
```

**Output:**
```
Creating saloon_redis ...
Creating saloon_mysql ...
Creating saloon_mailpit ...
Creating saloon_app ...
Creating saloon_nginx ...
Creating saloon_phpmyadmin ...
```

### Step 3: Initialize Laravel

The app container generates a temporary `APP_KEY` when one is not supplied and runs migrations by default (`RUN_MIGRATIONS=true`). To run migrations manually, use:

```bash
docker compose exec app php artisan migrate
```

### Step 4: Rebuild Frontend Assets

Frontend assets are built inside the Docker image and served by Nginx from the shared `app_public` volume. After changing frontend code, rebuild and recreate the app/nginx containers:

```bash
docker compose build app
docker compose up -d app nginx
```

### Step 5: Access the Application

Open your browser and navigate to:

- **Application**: `http://localhost`
- **Mailpit (Email Testing)**: `http://localhost:8025`
- **PhpMyAdmin (Database)**: `http://localhost:8080`

---

## Common Commands

### Container Management

```bash
# View all running containers
docker compose ps

# View container logs
docker compose logs -f app

# View logs for specific service
docker compose logs -f nginx

# Stop all containers
docker compose stop

# Start all containers
docker compose start

# Restart all containers
docker compose restart

# Remove containers (data in volumes persists)
docker compose down

# Remove containers and volumes
docker compose down -v
```

### Laravel Commands

```bash
# Execute Laravel artisan commands
docker compose exec app php artisan <command>

# Examples:
docker compose exec app php artisan migrate
docker compose exec app php artisan seed:db
docker compose exec app php artisan tinker
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear
docker compose exec app php artisan queue:work
```

### Database Commands

```bash
# Access MySQL CLI
docker compose exec db mysql -u saloon_user -psaloon_password saloon_db

# Create a database backup
docker compose exec db mysqldump -u saloon_user -psaloon_password saloon_db > backup.sql

# Restore from backup
docker compose exec -T db mysql -u saloon_user -psaloon_password saloon_db < backup.sql
```

### Frontend Asset Commands

```bash
# Rebuild the Docker image after changing package.json or frontend source
docker compose build app
docker compose up -d app nginx

# Optional local development when Node.js is installed on your host
npm install
npm run dev
```

### File Permissions

```bash
# Fix storage directory permissions
docker compose exec app chmod -R 775 storage bootstrap/cache

# Reset permissions
docker compose exec app chown -R www-data:www-data storage bootstrap/cache
```

---

## Accessing Services

### Web Application

- **URL**: `http://localhost`
- **Nginx Port**: 80 (or custom `NGINX_PORT`)

### Mailpit (Email Testing)

- **URL**: `http://localhost:8025`
- **SMTP**: `mailpit:1025` (from containers)
- **SMTP**: `localhost:1025` (from local machine)

### PhpMyAdmin (Database GUI)

- **URL**: `http://localhost:8080`
- **Username**: `saloon_user` (or root)
- **Password**: `saloon_password`

### Redis

- **Host**: `redis` (from containers) or `localhost` (local machine)
- **Port**: `6379`
- **Password**: `redis_password`

### MySQL

- **Host**: `db` (from containers) or `localhost` (local machine)
- **Port**: `3306`
- **Username**: `saloon_user`
- **Password**: `saloon_password`
- **Database**: `saloon_db`

---

## Development Workflow

### Making Code Changes

The Compose stack runs a production-like image. Rebuild the app image after code changes that need to run inside Docker:

1. **Edit PHP files** in `app/` or `routes/`
   - Rebuild/recreate the app container: `docker compose build app && docker compose up -d app`
   - Run `docker compose exec app php artisan optimize:clear` if cached config/routes need clearing

2. **Edit React/JavaScript files** in `resources/`
   - Rebuild/recreate app and nginx: `docker compose build app && docker compose up -d app nginx`
   - For hot reload, run `npm run dev` on your host and configure `VITE_API_BASE_URL=http://localhost/api`

3. **Edit configuration files**
   - Restart or recreate the container: `docker compose up -d --force-recreate app`

### Running Tests

```bash
# Run PHP tests
docker compose exec app php artisan test

# Run with coverage
docker compose exec app php artisan test --coverage

# Run specific test
docker compose exec app php artisan test tests/Unit/YourTest.php
```

### Debugging

#### Using Laravel Tinker

```bash
docker compose exec app php artisan tinker
```

#### Viewing Logs

```bash
# View Laravel logs
docker compose exec app tail -f storage/logs/laravel.log

# View Nginx logs
docker compose logs nginx
```

#### Database Inspection

```bash
# Access MySQL CLI
docker compose exec db mysql -u saloon_user -psaloon_password saloon_db

# Or use PhpMyAdmin at http://localhost:8080
```

---

## Troubleshooting

### Application won't start

```bash
# Check container logs
docker compose logs app

# Rebuild images
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Database connection errors

```bash
# Verify database is running
docker compose ps db

# Check if port is available
lsof -i :3306

# Restart database
docker compose restart db
```

### Port already in use

```bash
# If port 80 is in use, change NGINX_PORT in .env
# If port 3306 is in use, change DB_PORT in .env
# Then restart: docker compose restart
```

### Permission denied errors

```bash
# Fix permissions
docker compose exec app chmod -R 755 storage
docker compose exec app chown -R www-data:www-data storage
```

### Dependencies or frontend assets look stale

```bash
# Rebuild the image that installs Composer dependencies and builds Vite assets
docker compose build --no-cache app
docker compose up -d app nginx
```

### Container keeps restarting

```bash
# Check logs for errors
docker compose logs app

# Rebuild without cache
docker compose build --no-cache app
```

---

## Additional Resources

### Docker Documentation
- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)

### Laravel Documentation
- [Laravel Official Guide](https://laravel.com/docs)
- [Laravel Docker Setup](https://laravel.com/docs/deployment/docker)

### React/Vite Documentation
- [Vite Official Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

### MySQL & Redis
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Redis Documentation](https://redis.io/documentation)

---

## Quick Start (TL;DR)

```bash
# Clone and setup
git clone https://github.com/salonovapp/saloon-management.git
cd saloon-management
git checkout docker_container_main

# Configure
cp .env.docker.example .env
mkdir -p storage/docker/logs/{php,nginx} docker/mysql docker/nginx/conf.d docker/nginx/ssl

# Run
docker compose build
docker compose up -d

# Verify migrations
docker compose exec app php artisan migrate:status

# Access
# Application: http://localhost
# Mailpit: http://localhost:8025
# PhpMyAdmin: http://localhost:8080
```

---

## Support

For issues or questions, please create an issue on the [GitHub repository](https://github.com/salonovapp/saloon-management/issues).

---

**Last Updated**: June 5, 2026
**Docker Setup Version**: 1.1
