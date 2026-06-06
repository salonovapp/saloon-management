# Docker Review Notes

## Findings fixed

- Replaced the MySQL service, MySQL init script, MySQL health check, and phpMyAdmin with PostgreSQL 16, a PostgreSQL init script, `pg_isready`, and pgAdmin.
- Fixed the PHP image so it no longer calls Apache-only `a2enmod` in an Alpine PHP-FPM image.
- Added the PostgreSQL PHP extension (`pdo_pgsql`) and Redis PHP extension required by the configured Laravel database/cache settings.
- Added an Nginx configuration file that was referenced by Compose but missing from the repository.
- Added a container entrypoint that prepares writable Laravel directories, validates `APP_KEY`, optionally runs migrations/seeders, and starts PHP-FPM or the queue worker.
- Changed the default Docker stack to run from built images instead of bind-mounting the whole repository, preventing host machines without `vendor`, `node_modules`, or built Vite assets from breaking first startup.
- Updated Vite/Laravel integration so the React SPA is built into `public/build` and rendered by Laravel at `/`.
- Added a `/health` route for container health checks.
- Added `.dockerignore` and Docker environment templates.

## Startup expectation

A new developer can run:

```bash
cp .env.docker.example .env
docker compose up -d --build
```

The application should become available at <http://localhost>, with the API under `/api`, Mailpit at <http://localhost:8025>, and pgAdmin at <http://localhost:5050>.
