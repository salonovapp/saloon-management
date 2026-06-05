#!/usr/bin/env sh
set -eu

cd /app

mkdir -p storage/app/public storage/framework/cache/data storage/framework/sessions storage/framework/testing storage/framework/views storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
chmod -R ug+rwX storage bootstrap/cache 2>/dev/null || true

if [ -z "${APP_KEY:-}" ]; then
    echo "APP_KEY is empty; generating an ephemeral application key for this container. Set APP_KEY in .env for stable encrypted data."
    export APP_KEY="$(php artisan key:generate --show --no-interaction)"
fi

php artisan config:clear --no-interaction >/dev/null 2>&1 || true

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force --no-interaction
fi

if [ "${RUN_SEEDERS:-false}" = "true" ]; then
    php artisan db:seed --force --no-interaction
fi

exec "$@"
