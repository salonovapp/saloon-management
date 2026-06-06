# Multi-stage Dockerfile for the Laravel API + React SPA.
# The final image contains PHP-FPM, Composer dependencies, and built Vite assets.

FROM node:22-alpine AS frontend-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY vite.config.js ./
COPY resources ./resources
RUN npm run build

FROM php:8.3-fpm-alpine AS app

WORKDIR /app

RUN apk add --no-cache \
        bash \
        curl \
        git \
        libzip-dev \
        oniguruma-dev \
        postgresql-client \
        postgresql-dev \
        unzip \
        zip \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && docker-php-ext-configure opcache --enable-opcache \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        mbstring \
        opcache \
        pdo_pgsql \
        zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --no-interaction \
        --no-progress \
        --prefer-dist \
        --optimize-autoloader \
        --no-scripts

COPY . ./
COPY --from=frontend-builder /app/public/build ./public/build
COPY docker/php/entrypoint.sh /usr/local/bin/saloon-entrypoint

RUN composer dump-autoload --optimize \
    && chmod +x /usr/local/bin/saloon-entrypoint \
    && mkdir -p storage/app/public storage/framework/cache/data storage/framework/sessions storage/framework/testing storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache public/build \
    && chmod -R ug+rwX storage bootstrap/cache

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD php artisan about --only=environment >/dev/null 2>&1 || exit 1

ENTRYPOINT ["saloon-entrypoint"]
CMD ["php-fpm"]
