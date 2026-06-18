#!/usr/bin/env bash
set -euo pipefail

BACKUP_FILE="${1:?Usage: restore-wwjcar.sh /path/to/wwjcar.dump}"
DATABASE_URL="${DATABASE_URL:-postgresql://wwjcar_app:replace-with-strong-db-password@127.0.0.1:5432/wwjcar}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-server-postgres}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

if command -v pg_restore >/dev/null 2>&1; then
  pg_restore --list "$BACKUP_FILE" >/dev/null
else
  docker exec -i "$POSTGRES_CONTAINER" pg_restore --list < "$BACKUP_FILE" >/dev/null
fi

if command -v pg_restore >/dev/null 2>&1; then
  pg_restore "$DATABASE_URL" --clean --if-exists --no-owner --no-acl "$BACKUP_FILE"
else
  docker exec -i "$POSTGRES_CONTAINER" pg_restore "$DATABASE_URL" --clean --if-exists --no-owner --no-acl < "$BACKUP_FILE"
fi

echo "Restore complete from $BACKUP_FILE"
