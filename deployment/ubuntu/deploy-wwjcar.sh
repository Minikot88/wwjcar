#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/home/ubuntu/infra/projects/wwjcar"
REPO_SOURCE="${1:-$PWD}"

mkdir -p "$APP_ROOT/frontend" "$APP_ROOT/backend" "$APP_ROOT/backups" "$APP_ROOT/logs"

rsync -a --delete \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude "backend/node_modules" \
  --exclude "dist" \
  "$REPO_SOURCE/" "$APP_ROOT/source/"

cd "$APP_ROOT/source"
npm ci
npm run build

rsync -a --delete "$APP_ROOT/source/dist/" "$APP_ROOT/frontend/"

rsync -a --delete \
  --exclude "node_modules" \
  --exclude ".env" \
  "$APP_ROOT/source/backend/" "$APP_ROOT/backend/"

cd "$APP_ROOT/backend"
npm ci --omit=dev

if [[ ! -f "$APP_ROOT/backend/.env" ]]; then
  cp "$APP_ROOT/backend/.env.production.example" "$APP_ROOT/backend/.env"
  echo "Created $APP_ROOT/backend/.env. Edit it before starting the API."
  exit 1
fi

npm run migrate
npm run seed

if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi

pm2 startOrReload ecosystem.config.cjs --env production
pm2 save

echo "WWJ Car Rent deployed to $APP_ROOT"
