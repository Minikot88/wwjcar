#!/usr/bin/env bash
set -euo pipefail

POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-server-postgres}"
API_PORT="${API_PORT:-4000}"
DB_NAME="${DB_NAME:-wwjcar}"
DB_USER="${DB_USER:-wwjcar_app}"

echo "== API health =="
curl -fsS "http://127.0.0.1:$API_PORT/api/health"
echo

echo "== PM2 =="
pm2 status wwjcar-api || true

echo "== PostgreSQL private binding =="
docker port "$POSTGRES_CONTAINER" || true
ss -lntp | grep ':5432' || true

echo "== Admin ports =="
ss -lntp | grep -E ':(81|9000|3001)' || true

echo "== Database exists =="
docker exec "$POSTGRES_CONTAINER" bash -lc "psql -U \"\$POSTGRES_USER\" -d \"\${POSTGRES_DB:-postgres}\" -tAc \"SELECT datname FROM pg_database WHERE datname = '$DB_NAME'\""

echo "== Role exists =="
docker exec "$POSTGRES_CONTAINER" bash -lc "psql -U \"\$POSTGRES_USER\" -d \"\${POSTGRES_DB:-postgres}\" -tAc \"SELECT rolname FROM pg_roles WHERE rolname = '$DB_USER'\""

echo "== Tables =="
docker exec "$POSTGRES_CONTAINER" bash -lc "psql -U \"\$POSTGRES_USER\" -d \"$DB_NAME\" -c '\dt wwjcar.*'"

echo "== Views =="
docker exec "$POSTGRES_CONTAINER" bash -lc "psql -U \"\$POSTGRES_USER\" -d \"$DB_NAME\" -c '\dv wwjcar.*'"

echo "== Seed counts =="
docker exec "$POSTGRES_CONTAINER" bash -lc "psql -U \"\$POSTGRES_USER\" -d \"$DB_NAME\" -c \"SET search_path TO wwjcar, public; SELECT 'cars' AS table_name, count(*) FROM cars UNION ALL SELECT 'faqs', count(*) FROM faqs UNION ALL SELECT 'settings', count(*) FROM site_settings UNION ALL SELECT 'pages', count(*) FROM pages UNION ALL SELECT 'reviews', count(*) FROM reviews;\""

echo "== Foreign keys and indexes =="
docker exec "$POSTGRES_CONTAINER" bash -lc "psql -U \"\$POSTGRES_USER\" -d \"$DB_NAME\" -c \"SELECT conname, conrelid::regclass AS table_name FROM pg_constraint WHERE contype = 'f' AND connamespace = 'wwjcar'::regnamespace ORDER BY conname;\""
docker exec "$POSTGRES_CONTAINER" bash -lc "psql -U \"\$POSTGRES_USER\" -d \"$DB_NAME\" -c \"SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'wwjcar' ORDER BY tablename, indexname;\""

echo "== Backup timer =="
systemctl list-timers | grep wwjcar || true
