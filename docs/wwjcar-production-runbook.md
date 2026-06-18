# WWJ Car Rent Production Runbook

This runbook is for the Ubuntu server at `168.110.198.88`.

## Current Known Constraint

PostgreSQL runs in Docker container:

```txt
Container: server-postgres
Port mapping: 127.0.0.1:5432 -> 5432
```

Keep this private. Do not bind PostgreSQL to `0.0.0.0`.

## 1. Discover PostgreSQL

```bash
chmod +x deployment/ubuntu/*.sh
deployment/ubuntu/discover-postgres-container.sh
```

This reports:

- `POSTGRES_USER`
- `POSTGRES_DB`
- whether password is from env or file
- current databases
- roles
- `wwjcar` tables/views/extensions if present

## 2. Full Production Setup

```bash
deployment/ubuntu/wwjcar-production-orchestrator.sh
```

First run creates:

```txt
/home/ubuntu/infra/projects/wwjcar/backend/.env
```

Fill:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Then rerun:

```bash
deployment/ubuntu/wwjcar-production-orchestrator.sh
```

## 3. Verify Production

```bash
deployment/ubuntu/verify-wwjcar-production.sh
```

Expected:

- `/api/health` returns `{"status":"ok"}`
- PM2 `wwjcar-api` is online
- Docker PostgreSQL mapping remains `127.0.0.1:5432`
- `wwjcar` database exists
- `wwjcar_app` role exists
- `wwjcar` schema exists
- app user search_path is `wwjcar, public`
- tables and views are visible
- seed counts show data
- backup timer exists

## DBeaver Configuration

Preferred: SSH tunnel.

Main tab:

```txt
Host: 127.0.0.1
Port: 5432
Database: wwjcar
Username: wwjcar_app
SSL mode: disable
JDBC URL: jdbc:postgresql://127.0.0.1:5432/wwjcar
```

SSH tab:

```txt
SSH Host: 168.110.198.88
SSH User: ubuntu
Authentication: private key
Remote host: 127.0.0.1
Remote port: 5432
Local port: 5432
```

## Uptime Kuma

Create monitor:

```txt
Type: HTTP(s)
Name: WWJ Car Rent API
URL: https://api.wwjcarrent.com/api/health
Expected status: 200
Keyword: ok
Interval: 60s
```

## Backups

Manual:

```bash
source /home/ubuntu/infra/projects/wwjcar/backend/.env
/home/ubuntu/infra/projects/wwjcar/source/deployment/ubuntu/backup-wwjcar.sh
```

Restore:

```bash
source /home/ubuntu/infra/projects/wwjcar/backend/.env
/home/ubuntu/infra/projects/wwjcar/source/deployment/ubuntu/restore-wwjcar.sh /home/ubuntu/infra/backups/wwjcar/wwjcar-YYYYMMDD-HHMMSS.dump
pm2 restart wwjcar-api
```

## Security Checks

```bash
docker port server-postgres
ss -lntp | grep -E ':(5432|81|9000|3001|4000)'
sudo ufw status verbose
```

Expected:

- PostgreSQL maps only to `127.0.0.1:5432`.
- Ports `81`, `9000`, and `3001` should not be public.
- Public ingress should be through Nginx Proxy Manager on `80/443`.
