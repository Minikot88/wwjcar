# WWJ Car Rent Restore Guide

## Purpose

Use this guide to restore the WWJ Car Rent PostgreSQL database from a verified `.dump` backup.

## Preconditions

- Operator is logged into the Ubuntu server.
- PostgreSQL Docker container `server-postgres` is running.
- Backup file exists in `/home/ubuntu/infra/backups/wwjcar`.
- Backend `.env` contains a valid `DATABASE_URL`.

## List Backups

```bash
ls -lah /home/ubuntu/infra/backups/wwjcar
```

## Verify Backup Before Restore

```bash
pg_restore --list /home/ubuntu/infra/backups/wwjcar/wwjcar-YYYYMMDDTHHMMSSZ.dump >/dev/null
```

If `pg_restore` is not installed on the host:

```bash
docker exec -i server-postgres pg_restore --list < /home/ubuntu/infra/backups/wwjcar/wwjcar-YYYYMMDDTHHMMSSZ.dump >/dev/null
```

## Restore Production Database

```bash
cd /home/ubuntu/infra/projects/wwjcar/backend
set -a
. ./.env
set +a
/home/ubuntu/infra/projects/wwjcar/source/deployment/ubuntu/restore-wwjcar.sh /home/ubuntu/infra/backups/wwjcar/wwjcar-YYYYMMDDTHHMMSSZ.dump
```

## Verify Restore

```bash
docker exec -it server-postgres psql "$DATABASE_URL" -c "SET search_path TO wwjcar, public; SELECT COUNT(*) FROM cars;"
docker exec -it server-postgres psql "$DATABASE_URL" -c "SET search_path TO wwjcar, public; SELECT COUNT(*) FROM pages;"
docker exec -it server-postgres psql "$DATABASE_URL" -c "SET search_path TO wwjcar, public; SELECT COUNT(*) FROM faqs;"
```

## Restart Backend

```bash
pm2 restart wwjcar-api --update-env
curl -fsS http://127.0.0.1:4000/api/health
```

## Notes

The restore script validates the dump with `pg_restore --list` before applying it.

Restoring to production is destructive because it uses:

```bash
pg_restore --clean --if-exists
```
