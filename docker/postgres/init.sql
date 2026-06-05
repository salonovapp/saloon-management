-- PostgreSQL initialization for the Saloon Management database.
-- The official postgres image creates the database/user from POSTGRES_* variables.
\connect saloon_db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
