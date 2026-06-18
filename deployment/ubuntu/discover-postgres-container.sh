#!/usr/bin/env bash
set -euo pipefail

POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-server-postgres}"

echo "== Container =="
docker inspect "$POSTGRES_CONTAINER" --format 'Name={{.Name}} Image={{.Config.Image}} Status={{.State.Status}}'

echo
echo "== Port mappings =="
docker port "$POSTGRES_CONTAINER" || true

echo
echo "== PostgreSQL env source =="
docker inspect "$POSTGRES_CONTAINER" --format '{{range .Config.Env}}{{println .}}{{end}}' | grep -E '^(POSTGRES_USER|POSTGRES_DB|POSTGRES_PASSWORD_FILE|POSTGRES_PASSWORD)=' || true

echo
echo "== Databases =="
docker exec "$POSTGRES_CONTAINER" bash -lc 'psql -U "$POSTGRES_USER" -d "${POSTGRES_DB:-postgres}" -c "\l"'

echo
echo "== Roles =="
docker exec "$POSTGRES_CONTAINER" bash -lc 'psql -U "$POSTGRES_USER" -d "${POSTGRES_DB:-postgres}" -c "\du"'

echo
echo "== WWJ schema objects if database exists =="
if docker exec "$POSTGRES_CONTAINER" bash -lc 'psql -U "$POSTGRES_USER" -d "${POSTGRES_DB:-postgres}" -tAc "SELECT 1 FROM pg_database WHERE datname = '\''wwjcar'\''"' | grep -q 1; then
  docker exec "$POSTGRES_CONTAINER" bash -lc 'psql -U "$POSTGRES_USER" -d wwjcar -c "\dn+"'
  docker exec "$POSTGRES_CONTAINER" bash -lc 'psql -U "$POSTGRES_USER" -d wwjcar -c "\dt+ wwjcar.*"'
  docker exec "$POSTGRES_CONTAINER" bash -lc 'psql -U "$POSTGRES_USER" -d wwjcar -c "\dv+ wwjcar.*"'
  docker exec "$POSTGRES_CONTAINER" bash -lc 'psql -U "$POSTGRES_USER" -d wwjcar -c "\dx"'
else
  echo "wwjcar database does not exist."
fi
