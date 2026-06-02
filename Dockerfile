# Multi-stage Dockerfile for Laravel + React application
# Stage 1: Build stage
FROM node:22-alpine as node-builder

WORKDIR /app

# Copy package files for Node dependencies
COPY package*.json ./

# Install Node dependencies
RUN npm ci

# Copy source files
COPY . .

# Build React/Vite frontend
RUN npm run build

# Stage 2: PHP Runtime
FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    git \
    zip \
    unzip \
    oniguruma-dev \
    libzip-dev \
    sqlite-dev \
    mysql-client \
    postgresql-client

# Install PHP extensions
RUN docker-php-ext-configure opcache --enable-opcache && \
    docker-php-ext-install -j$(nproc) \
    bcmath \
    ctype \
    fileinfo \
    json \
    mbstring \
    openssl \
    pdo \
    pdo_sqlite \
    pdo_mysql \
    pdo_pgsql \
    tokenizer \
    xml \
    xmlreader \
    opcache \
    zip

# Enable mod_rewrite for Apache (if using Apache)
RUN a2enmod rewrite

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app

# Copy PHP application files
COPY . .

# Copy built frontend assets from node builder
COPY --from=node-builder /app/public/build ./public/build

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set proper permissions
RUN chown -R www-data:www-data /app && \
    chmod -R 755 /app && \
    chmod -R 775 /app/storage /app/bootstrap/cache

# Expose port
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:9000 || exit 1

# Start PHP-FPM
CMD ["php-fpm"]
