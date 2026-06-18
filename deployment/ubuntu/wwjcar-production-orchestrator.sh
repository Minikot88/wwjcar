#!/usr/bin/env bash
set -euo pipefail

POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-server-postgres}"
APP_ROOT="${APP_ROOT:-/home/ubuntu/infra/projects/wwjcar}"
SOURCE_ROOT="${SOURCE_ROOT:-$PWD}"
DB_NAME="${DB_NAME:-wwjcar}"
DB_USER="${DB_USER:-wwjcar_app}"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 36 | tr -d '\n')}"
BACKUP_ROOT="${BACKUP_ROOT:-/home/ubuntu/infra/backups/wwjcar}"
API_PORT="${API_PORT:-4000}"
FRONTEND_URL="${FRONTEND_URL:-https://wwjcarrent.com}"
API_URL="${API_URL:-https://api.wwjcarrent.com}"

need() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

container_psql() {
  docker exec "$POSTGRES_CONTAINER" bash -lc \
    "psql -v ON_ERROR_STOP=1 -U \"\$POSTGRES_USER\" -d \"\${POSTGRES_DB:-postgres}\" $*"
}

container_psql_db() {
  local database="$1"
  shift
  docker exec "$POSTGRES_CONTAINER" bash -lc \
    "psql -v ON_ERROR_STOP=1 -U \"\$POSTGRES_USER\" -d \"$database\" $*"
}

section() {
  printf '\n== %s ==\n' "$1"
}

need docker
need openssl
need rsync
need npm

POSTGRES_ADMIN_USER="$(docker exec "$POSTGRES_CONTAINER" printenv POSTGRES_USER)"
POSTGRES_ADMIN_DB="$(docker exec "$POSTGRES_CONTAINER" printenv POSTGRES_DB 2>/dev/null || true)"
POSTGRES_ADMIN_DB="${POSTGRES_ADMIN_DB:-postgres}"

section "Discover PostgreSQL container"
docker inspect "$POSTGRES_CONTAINER" --format 'Name={{.Name}} Image={{.Config.Image}} Status={{.State.Status}}'
docker inspect "$POSTGRES_CONTAINER" --format '{{range .Config.Env}}{{println .}}{{end}}' | grep -E '^(POSTGRES_USER|POSTGRES_DB|POSTGRES_PASSWORD_FILE|POSTGRES_PASSWORD)=' || true
docker port "$POSTGRES_CONTAINER" || true

section "Database audit before setup"
container_psql "-c '\l'"
container_psql "-c '\du'"

section "Create database and least-privilege role"
if ! docker exec "$POSTGRES_CONTAINER" psql -U "$POSTGRES_ADMIN_USER" -d "$POSTGRES_ADMIN_DB" -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
  docker exec "$POSTGRES_CONTAINER" createdb -U "$POSTGRES_ADMIN_USER" "$DB_NAME"
fi

docker exec -i "$POSTGRES_CONTAINER" psql -v ON_ERROR_STOP=1 -U "$POSTGRES_ADMIN_USER" -d "$POSTGRES_ADMIN_DB" <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', '$DB_USER', '$DB_PASSWORD');
  ELSE
    EXECUTE format('ALTER ROLE %I WITH LOGIN PASSWORD %L', '$DB_USER', '$DB_PASSWORD');
  END IF;
END
\$\$;
REVOKE ALL ON DATABASE $DB_NAME FROM PUBLIC;
GRANT CONNECT ON DATABASE $DB_NAME TO $DB_USER;
SQL

docker exec -i "$POSTGRES_CONTAINER" psql -v ON_ERROR_STOP=1 -U "$POSTGRES_ADMIN_USER" -d "$DB_NAME" <<SQL
REVOKE ALL ON SCHEMA public FROM PUBLIC;
CREATE SCHEMA IF NOT EXISTS wwjcar AUTHORIZATION $DB_USER;
ALTER ROLE $DB_USER IN DATABASE $DB_NAME SET search_path = wwjcar, public;
ALTER DATABASE $DB_NAME SET search_path = wwjcar, public;
GRANT USAGE, CREATE ON SCHEMA wwjcar TO $DB_USER;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA wwjcar TO $DB_USER;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA wwjcar TO $DB_USER;
ALTER DEFAULT PRIVILEGES FOR ROLE $DB_USER IN SCHEMA wwjcar GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES FOR ROLE $DB_USER IN SCHEMA wwjcar GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO $DB_USER;
ALTER DEFAULT PRIVILEGES FOR ROLE $DB_USER IN SCHEMA wwjcar GRANT EXECUTE ON FUNCTIONS TO $DB_USER;
SQL

section "Prepare project directories"
mkdir -p "$APP_ROOT/source" "$APP_ROOT/frontend" "$APP_ROOT/backend" "$APP_ROOT/logs" "$APP_ROOT/backups" "$BACKUP_ROOT"
rsync -a --delete \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude "backend/node_modules" \
  --exclude "dist" \
  "$SOURCE_ROOT/" "$APP_ROOT/source/"

section "Generate production environment"
mkdir -p "$APP_ROOT/backend"
if [[ ! -f "$APP_ROOT/backend/.env" ]]; then
  cat > "$APP_ROOT/backend/.env" <<ENV
NODE_ENV=production
PORT=$API_PORT
APP_URL=$FRONTEND_URL
API_URL=$API_URL
CORS_ORIGIN=$FRONTEND_URL,https://www.wwjcarrent.com
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@127.0.0.1:5432/$DB_NAME
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_CONNECTION_LIMIT=10
JWT_ACCESS_SECRET=$(openssl rand -hex 48)
JWT_REFRESH_SECRET=$(openssl rand -hex 48)
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ADMIN_EMAIL=admin@wwjcarrent.local
ADMIN_PASSWORD=$(openssl rand -base64 24 | tr -d '\n')
ADMIN_NAME=WWJ Admin
CLOUDINARY_CLOUD_NAME=REPLACE_ME
CLOUDINARY_API_KEY=REPLACE_ME
CLOUDINARY_API_SECRET=REPLACE_ME
CLOUDINARY_FOLDER=wwj-car-rent
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
AUTH_RATE_LIMIT_MAX=20
BACKUP_DIR=$BACKUP_ROOT
POSTGRES_CONTAINER=$POSTGRES_CONTAINER
ENV
  chmod 600 "$APP_ROOT/backend/.env"
  echo "Created $APP_ROOT/backend/.env. Fill Cloudinary values, then rerun this script."
  exit 1
fi

if grep -q 'REPLACE_ME' "$APP_ROOT/backend/.env"; then
  echo "Cloudinary values still contain REPLACE_ME in $APP_ROOT/backend/.env"
  echo "Fill CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, then rerun."
  exit 1
fi

section "Build frontend"
cd "$APP_ROOT/source"
cat > .env.production <<ENV
VITE_APP_NAME=WWJ Car Rent
VITE_SITE_URL=$FRONTEND_URL
VITE_CANONICAL_URL=$FRONTEND_URL
VITE_API_BASE_URL=$API_URL/api
VITE_ENFORCE_HTTPS=true
VITE_REDIRECT_WWW=false
ENV
npm ci
npm run build
rsync -a --delete "$APP_ROOT/source/dist/" "$APP_ROOT/frontend/"

section "Deploy backend"
rsync -a --delete --exclude ".env" --exclude "node_modules" "$APP_ROOT/source/backend/" "$APP_ROOT/backend/"
cd "$APP_ROOT/backend"
npm ci --omit=dev
npm run migrate
npm run seed

section "Reapply least privilege grants"
docker exec -i "$POSTGRES_CONTAINER" psql -v ON_ERROR_STOP=1 -U "$POSTGRES_ADMIN_USER" -d "$DB_NAME" <<SQL
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA wwjcar TO $DB_USER;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA wwjcar TO $DB_USER;
SQL

section "Start PM2 API"
if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi
pm2 startOrReload ecosystem.config.cjs --env production
pm2 save

section "Install daily backup timer"
sudo cp "$APP_ROOT/source/deployment/ubuntu/wwjcar-backup.service" /etc/systemd/system/
sudo cp "$APP_ROOT/source/deployment/ubuntu/wwjcar-backup.timer" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now wwjcar-backup.timer

section "Security checks"
ss -lntp | grep -E ':(5432|81|9000|3001|4000)' || true
curl -fsS "http://127.0.0.1:$API_PORT/api/health"
echo
container_psql_db "$DB_NAME" "-c '\dt'"
container_psql_db "$DB_NAME" "-c '\dt wwjcar.*'"
container_psql_db "$DB_NAME" "-c '\dv wwjcar.*'"

cat <<REPORT

Production setup complete.

DBeaver recommended connection:
  Use SSH tunnel to ubuntu@168.110.198.88
  Local host: 127.0.0.1
  Local port: 5432
  Remote host: 127.0.0.1
  Remote port: 5432
  Database: $DB_NAME
  Username: $DB_USER
  JDBC URL: jdbc:postgresql://127.0.0.1:5432/$DB_NAME

Do not expose PostgreSQL publicly. Current Docker mapping should remain:
  127.0.0.1:5432 -> 5432
REPORT
