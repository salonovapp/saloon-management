-- MySQL Database Initialization Script
-- This file runs automatically when the MySQL container starts

-- Create database with proper character set
CREATE DATABASE IF NOT EXISTS saloon_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user and grant privileges
CREATE USER IF NOT EXISTS 'saloon_user'@'%' IDENTIFIED BY 'saloon_password';
GRANT ALL PRIVILEGES ON saloon_db.* TO 'saloon_user'@'%' WITH GRANT OPTION;

-- Grant privileges on all databases to root
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- Apply privilege changes
FLUSH PRIVILEGES;
