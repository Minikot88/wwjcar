# WWJ Car Rent Temporary Subdomain Deployment Guide

This guide prepares WWJ Car Rent for a temporary subdomain before the final dedicated domain is ready.

## Target Shape

Use one public temporary host for the frontend:

```text
https://wwjcar.example.com
```

Recommended API shape:

```text
https://wwjcar.example.com/api
```

Using same-origin `/api` avoids browser CORS issues and keeps SEO URLs simple.

## Frontend Environment

Create or update the frontend build environment before running `npm run build`:

```env
VITE_APP_NAME=WWJ Car Rent
VITE_SITE_URL=https://wwjcar.example.com
VITE_CANONICAL_URL=https://wwjcar.example.com
VITE_API_BASE_URL=/api
VITE_PORT=5180
VITE_ENFORCE_HTTPS=true
VITE_REDIRECT_WWW=false
```

Replace `https://wwjcar.example.com` with the real temporary subdomain.

These values control:

- canonical URLs
- Open Graph URLs
- Twitter Card image URLs
- structured data URLs
- sitemap URLs
- robots.txt sitemap URL
- static prerender HTML URLs

## Build

From the project root:

```bash
cp .env.subdomain.example .env
nano .env
npm run build
```

The build will regenerate:

```text
public/sitemap.xml
public/robots.txt
dist/sitemap.xml
dist/robots.txt
dist/**/*.html
```

## Server Deployment

Current frontend container serves:

```text
/home/ubuntu/infra/projects/wwjcar/frontend/dist
```

Deploy the generated `dist` directory to:

```bash
/home/ubuntu/infra/projects/wwjcar/frontend/dist
```

Then recreate the frontend container:

```bash
cd /home/ubuntu/infra/projects/wwjcar/frontend
docker compose up -d --force-recreate wwjcar-frontend
```

## Nginx Proxy Manager Configuration

Create one Proxy Host.

### Details Tab

```text
Domain Names:
wwjcar.example.com

Scheme:
http

Forward Hostname / IP:
127.0.0.1

Forward Port:
8081

Cache Assets:
Enabled

Block Common Exploits:
Enabled

Websockets Support:
Disabled
```

### Custom Locations

Add API proxy:

```text
Location:
/api

Scheme:
http

Forward Hostname / IP:
127.0.0.1

Forward Port:
4000
```

If Nginx Proxy Manager does not preserve the `/api` path correctly, use advanced custom config:

```nginx
location /api/ {
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_pass http://127.0.0.1:4000/api/;
}
```

### SSL Tab

```text
Request a new SSL Certificate:
Enabled

Force SSL:
Enabled

HTTP/2 Support:
Enabled

HSTS Enabled:
Enabled after successful verification
```

Do not enable HSTS until the temporary subdomain works over HTTPS.

## Backend Environment

For same-origin `/api`, backend CORS should include the temporary subdomain:

```env
APP_URL=https://wwjcar.example.com
API_URL=https://wwjcar.example.com/api
CORS_ORIGIN=https://wwjcar.example.com,http://168.110.198.88
```

Restart backend after changes:

```bash
pm2 restart wwjcar-api --update-env
```

## DNS

Create an `A` record:

```text
Type: A
Name: wwjcar
Value: 168.110.198.88
TTL: Auto or 300
```

Wait for DNS propagation before requesting SSL in Nginx Proxy Manager.

## Verification Checklist

Run from any machine:

```bash
curl -I https://wwjcar.example.com/
curl -I https://wwjcar.example.com/cars
curl -I https://wwjcar.example.com/availability
curl -I https://wwjcar.example.com/admin/login
curl https://wwjcar.example.com/api/health
curl https://wwjcar.example.com/robots.txt
curl https://wwjcar.example.com/sitemap.xml
```

Expected:

```text
Frontend routes: 200
API health: {"status":"ok"}
robots.txt Sitemap: https://wwjcar.example.com/sitemap.xml
sitemap.xml loc entries: https://wwjcar.example.com/...
canonical tags: https://wwjcar.example.com/...
og:url tags: https://wwjcar.example.com/...
structured data url fields: https://wwjcar.example.com/...
```

## Admin Verification

Verify:

```text
/admin/login
/admin/cars
/admin/uploads
/admin/operations/health
```

Admin upload verification:

- upload image
- preview Cloudinary image
- replace image
- delete test image
- verify Operations Dashboard Cloudinary status is `ok`

## Rollback

Restore the previous frontend `dist` backup:

```bash
cd /home/ubuntu/infra/projects/wwjcar/frontend
rm -rf dist
tar -xzf /home/ubuntu/infra/projects/wwjcar/backups/frontend/<backup-file>.tar.gz
docker compose up -d --force-recreate wwjcar-frontend
```

Restore previous backend env if needed:

```bash
cd /home/ubuntu/infra/projects/wwjcar/backend
cp .env.backup.<timestamp> .env
pm2 restart wwjcar-api --update-env
```
