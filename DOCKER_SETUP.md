# Docker Setup Guide for Saloon Management

This repository contains a Laravel backend/API and a React/Vite frontend. The Docker setup builds both parts into a runnable stack so a new developer only needs Docker and Docker Compose.

## Services

| Service | Container | Purpose | Default URL/Port |
| --- | --- | --- | --- |
| `nginx` | `saloon_nginx` | Public web server for the React SPA, Laravel routes, and API | <http://localhost> |
| `app` | `saloon_app` | PHP 8.3 FPM Laravel application; runs migrations on startup | internal `9000` |
| `queue` | `saloon_queue` | Laravel queue worker | internal |
| `db` | `saloon_postgres` | PostgreSQL 16 database | `localhost:5432` |
| `redis` | `saloon_redis` | Redis cache/session support | `localhost:6379` |
| `mailpit` | `saloon_mailpit` | Local email inbox | <http://localhost:8025> |
| `pgadmin` | `saloon_pgadmin` | PostgreSQL administration UI | <http://localhost:5050> |
| `frontend` | `saloon_frontend` | Optional Vite dev server profile | <http://localhost:5173> |

## Quick start

```bash
cp .env.docker.example .env
./docker-setup.sh
```

Or run the same setup manually:

```bash
cp .env.docker.example .env
docker compose build
docker compose up -d
```

The `app` container waits for PostgreSQL and Redis, uses the local-development `APP_KEY` from `.env`, and runs `php artisan migrate --force` by default.

> For shared development this key is fine. For staging/production, replace `APP_KEY` in `.env` with the output of `docker compose exec app php artisan key:generate --show` and restart the stack.

## Database: PostgreSQL

The project now defaults to PostgreSQL instead of MySQL.

Important environment values:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=saloon_db
DB_USERNAME=saloon_user
DB_PASSWORD=saloon_password
```

The official PostgreSQL image creates the database and user from these variables. `docker/postgres/init.sql` enables useful PostgreSQL extensions during first volume initialization.

If you previously ran the MySQL compose stack, reset local Docker volumes before starting the PostgreSQL stack:

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

## Useful commands

```bash
# Show all containers
docker compose ps

# Tail Laravel logs
docker compose logs -f app

# Run migrations manually
docker compose exec app php artisan migrate

# Fresh database with seeders
docker compose exec app php artisan migrate:fresh --seed

# Run the Laravel test suite
docker compose exec app php artisan test

# Open a PostgreSQL shell
docker compose exec db psql -U saloon_user -d saloon_db

# Stop containers without deleting data
docker compose down

# Stop containers and delete database/cache volumes
docker compose down -v
```

## Optional frontend dev server

The default stack serves built React assets through Laravel/Nginx. To run Vite in development mode with hot reload:

```bash
docker compose --profile dev up -d frontend
```

Then open <http://localhost:5173>. The Vite server uses `VITE_API_BASE_URL=http://localhost/api` by default.

## Optional live-code override

The default compose file is production-like: it runs the application from the built Docker image and stores only runtime data in named volumes. If you want live source-code mounts for local development:

```bash
cp docker-compose.override.yml.example docker-compose.override.yml
docker compose up -d --build
```

## Health checks

- Nginx checks `http://127.0.0.1/health`.
- Laravel checks `php artisan about --only=environment`.
- PostgreSQL uses `pg_isready`.
- Redis uses authenticated `redis-cli ping`.

## pgAdmin login

Default credentials are controlled by `.env`:

```dotenv
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin
```

In pgAdmin, add a server with:

- Host: `db`
- Port: `5432`
- Database: `saloon_db`
- Username: `saloon_user`
- Password: `saloon_password`
