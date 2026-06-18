-- Run as postgres superuser:
-- sudo -u postgres psql -f deployment/postgres/00-create-database-user.sql

SELECT 'CREATE DATABASE wwjcar'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'wwjcar')\gexec

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'wwjcar_app') THEN
    CREATE ROLE wwjcar_app LOGIN PASSWORD 'replace-with-strong-db-password';
  ELSE
    ALTER ROLE wwjcar_app WITH LOGIN PASSWORD 'replace-with-strong-db-password';
  END IF;
END
$$;

REVOKE ALL ON DATABASE wwjcar FROM PUBLIC;
GRANT CONNECT ON DATABASE wwjcar TO wwjcar_app;
