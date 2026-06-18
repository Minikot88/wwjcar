# WWJ Car Rent Production Backend Migration Guide

Target server:

```txt
Host: 168.110.198.88
OS: Ubuntu 24.04 LTS ARM64
User: ubuntu
Root path: /home/ubuntu/infra
Project path: /home/ubuntu/infra/projects/wwjcar
```

## Target Architecture

- Frontend: Vite static build
- Backend: Node.js + Express managed by PM2
- Database: existing local PostgreSQL instance
- Storage: Cloudinary
- Proxy/TLS: existing Nginx Proxy Manager
- Monitoring: existing Uptime Kuma
- Backups: daily `pg_dump` to `/home/ubuntu/infra/backups/wwjcar`

## 1. Server Directories

```bash
mkdir -p /home/ubuntu/infra/projects/wwjcar/frontend
mkdir -p /home/ubuntu/infra/projects/wwjcar/backend
mkdir -p /home/ubuntu/infra/projects/wwjcar/backups
mkdir -p /home/ubuntu/infra/projects/wwjcar/logs
mkdir -p /home/ubuntu/infra/backups/wwjcar
```

## 2. PostgreSQL Setup

Run as a PostgreSQL admin user from the repository root on the server:

```bash
sudo -u postgres psql -f deployment/ubuntu/setup-postgres.sql
```

Before running, replace `replace-with-strong-db-password` in:

```txt
deployment/ubuntu/setup-postgres.sql
backend/.env
```

The application should connect locally only:

```env
DATABASE_URL=postgresql://wwjcar_app:strong-password@127.0.0.1:5432/wwjcar
```

## 3. Backend Environment

Create:

```bash
cp /home/ubuntu/infra/projects/wwjcar/backend/.env.production.example /home/ubuntu/infra/projects/wwjcar/backend/.env
nano /home/ubuntu/infra/projects/wwjcar/backend/.env
```

Required production values:

```env
NODE_ENV=production
PORT=4000
APP_URL=https://wwjcarrent.com
API_URL=https://api.wwjcarrent.com
CORS_ORIGIN=https://wwjcarrent.com,https://www.wwjcarrent.com
DATABASE_URL=postgresql://wwjcar_app:strong-password@127.0.0.1:5432/wwjcar
JWT_ACCESS_SECRET=64-plus-random-characters
JWT_REFRESH_SECRET=another-64-plus-random-characters
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## 4. Frontend Environment

Create `.env.production` before build:

```env
VITE_SITE_URL=https://wwjcarrent.com
VITE_CANONICAL_URL=https://wwjcarrent.com
VITE_API_BASE_URL=https://api.wwjcarrent.com/api
```

## 5. Deploy

From the repository root on the server:

```bash
chmod +x deployment/ubuntu/*.sh
deployment/ubuntu/deploy-wwjcar.sh /path/to/local/repo
```

On first run, the deploy script creates `/home/ubuntu/infra/projects/wwjcar/backend/.env` and stops. Edit the real secrets, then run the deploy script again.

The script:

1. Builds the frontend.
2. Copies `dist` to `/home/ubuntu/infra/projects/wwjcar/frontend`.
3. Copies backend to `/home/ubuntu/infra/projects/wwjcar/backend`.
4. Installs backend production dependencies.
5. Runs PostgreSQL migrations.
6. Runs seed data.
7. Starts/reloads PM2 app `wwjcar-api`.

## 6. API Health Check

```bash
curl http://127.0.0.1:4000/api/health
```

Expected:

```json
{"status":"ok"}
```

## 7. Admin Verification

Verify these flows:

- Login
- Refresh session after page reload
- Logout
- Cars CRUD
- FAQ CRUD
- Pages CRUD
- Site Settings CRUD
- Rental Conditions CRUD
- Reviews CRUD
- Cloudinary uploads for car, hero, gallery, and logo images

## API Summary

Public:

- `GET /api/health`
- `GET /api/cars`
- `GET /api/cars/:slug`
- `GET /api/faqs`
- `GET /api/faq-categories`
- `GET /api/settings`
- `GET /api/pages`
- `GET /api/rental-conditions`
- `GET /api/reviews`

Admin:

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `POST /api/cars`
- `PUT /api/cars/:id`
- `DELETE /api/cars/:id`
- `POST /api/faqs`
- `PUT /api/faqs/:id`
- `DELETE /api/faqs/:id`
- `POST /api/pages`
- `PUT /api/pages/:id`
- `DELETE /api/pages/:id`
- `PUT /api/settings/:key`
- `POST /api/rental-conditions`
- `PUT /api/rental-conditions/:id`
- `DELETE /api/rental-conditions/:id`
- `POST /api/reviews`
- `PUT /api/reviews/:id`
- `DELETE /api/reviews/:id`
- `GET /api/uploads`
- `POST /api/uploads`
