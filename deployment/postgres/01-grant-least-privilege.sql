-- Run after creating the database and before/after migrations.
-- sudo -u postgres psql -d wwjcar -f deployment/postgres/01-grant-least-privilege.sql

REVOKE ALL ON SCHEMA public FROM PUBLIC;
CREATE SCHEMA IF NOT EXISTS wwjcar AUTHORIZATION wwjcar_app;
ALTER ROLE wwjcar_app IN DATABASE wwjcar SET search_path = wwjcar, public;
ALTER DATABASE wwjcar SET search_path = wwjcar, public;

GRANT USAGE, CREATE ON SCHEMA wwjcar TO wwjcar_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA wwjcar TO wwjcar_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA wwjcar TO wwjcar_app;

ALTER DEFAULT PRIVILEGES FOR ROLE wwjcar_app IN SCHEMA wwjcar
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO wwjcar_app;

ALTER DEFAULT PRIVILEGES FOR ROLE wwjcar_app IN SCHEMA wwjcar
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO wwjcar_app;

ALTER DEFAULT PRIVILEGES FOR ROLE wwjcar_app IN SCHEMA wwjcar
GRANT EXECUTE ON FUNCTIONS TO wwjcar_app;
