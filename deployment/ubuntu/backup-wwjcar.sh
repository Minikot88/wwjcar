#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/home/ubuntu/infra/backups/wwjcar}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DATABASE_URL="${DATABASE_URL:-postgresql://wwjcar_app:replace-with-strong-db-password@127.0.0.1:5432/wwjcar}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-server-postgres}"

mkdir -p "$BACKUP_DIR"

FILE_NAME="wwjcar-$TIMESTAMP.dump"
FILE_PATH="$BACKUP_DIR/$FILE_NAME"
TEMP_PATH="$FILE_PATH.tmp"

sql_escape() {
  printf "%s" "$1" | sed "s/'/''/g"
}

run_psql() {
  local sql="$1"
  if command -v psql >/dev/null 2>&1; then
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -c "$sql" >/dev/null
  else
    docker exec "$POSTGRES_CONTAINER" psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -c "$sql" >/dev/null
  fi
}

record_backup() {
  local status="$1"
  local size_bytes="${2:-0}"
  local error_message="${3:-}"

  if [ "$status" = "completed" ]; then
    run_psql "INSERT INTO wwjcar.database_backups (file_name, file_path, size_bytes, status) VALUES ('$(sql_escape "$FILE_NAME")', '$(sql_escape "$FILE_PATH")', $size_bytes, 'completed');" || true
  else
    run_psql "INSERT INTO wwjcar.database_backups (file_name, file_path, size_bytes, status, error_message) VALUES ('$(sql_escape "$FILE_NAME")', '$(sql_escape "$FILE_PATH")', $size_bytes, 'failed', '$(sql_escape "$error_message")');" || true
  fi
}

verify_backup() {
  if command -v pg_restore >/dev/null 2>&1; then
    pg_restore --list "$TEMP_PATH" >/dev/null
  else
    docker exec -i "$POSTGRES_CONTAINER" pg_restore --list < "$TEMP_PATH" >/dev/null
  fi
}

cleanup_temp() {
  rm -f "$TEMP_PATH"
}
trap cleanup_temp EXIT

if ! {
  if command -v pg_dump >/dev/null 2>&1; then
    pg_dump "$DATABASE_URL" --format=custom --no-owner --no-acl --file="$TEMP_PATH"
  else
    docker exec "$POSTGRES_CONTAINER" pg_dump "$DATABASE_URL" --format=custom --no-owner --no-acl > "$TEMP_PATH"
  fi

  verify_backup
}; then
  record_backup "failed" 0 "pg_dump or pg_restore verification failed"
  echo "Backup failed: $FILE_PATH" >&2
  exit 1
fi

mv "$TEMP_PATH" "$FILE_PATH"
SIZE_BYTES="$(stat -c%s "$FILE_PATH")"
record_backup "completed" "$SIZE_BYTES"

find "$BACKUP_DIR" -type f -name "wwjcar-*.dump" -mtime +"$BACKUP_RETENTION_DAYS" -delete

echo "Backup created and verified: $FILE_PATH ($SIZE_BYTES bytes)"
