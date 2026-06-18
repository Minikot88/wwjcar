# WWJ Car Rent DBeaver PostgreSQL Guide

## Recommended Security Model

Use an SSH tunnel for DBeaver whenever possible. This keeps PostgreSQL private and avoids exposing port `5432` publicly.

Direct PostgreSQL access is allowed only from a trusted public IP. Never allow `0.0.0.0/0` for PostgreSQL.

## Database

```txt
Database: wwjcar
Schema: wwjcar
User: wwjcar_app
Privilege model: least privilege application user
Host on server: 127.0.0.1
Port: 5432
```

## SQL Setup

Run as `postgres` on the Ubuntu server:

```bash
sudo -u postgres psql -f deployment/postgres/00-create-database-user.sql
sudo -u postgres psql -d wwjcar -f deployment/postgres/01-grant-least-privilege.sql
npm run migrate --prefix backend
npm run seed --prefix backend
sudo -u postgres psql -d wwjcar -f deployment/postgres/01-grant-least-privilege.sql
```

Optional SQL-only sample data for quick DBeaver inspection:

```bash
sudo -u postgres psql -d wwjcar -f deployment/postgres/03-seed-sample-data.sql
```

## Tables And Views

DBeaver should show:

Schema:

- `wwjcar`

Tables:

- `users`
- `refresh_tokens`
- `cars`
- `car_images`
- `uploads`
- `site_settings`
- `pages`
- `faq_categories`
- `faqs`
- `reviews`
- `rental_conditions`
- `schema_migrations`

Views:

- `car_inventory_view`
- `faq_with_categories_view`
- `cms_pages_view`
- `published_reviews_view`

Foreign keys and indexes are defined in the migrations and should appear under each table in DBeaver.

## DBeaver Via SSH Tunnel

Use this option first.

DBeaver connection:

```txt
Host: 127.0.0.1
Port: 5432
Database: wwjcar
Username: wwjcar_app
Password: production database password
SSL mode: disable
```

DBeaver SSH tab:

```txt
SSH Host: 168.110.198.88
SSH User: ubuntu
Authentication: private key
Local port: 5432
Remote host: 127.0.0.1
Remote port: 5432
```

Connection URL:

```txt
jdbc:postgresql://127.0.0.1:5432/wwjcar
```

## DBeaver Direct Trusted-IP Connection

Use only when SSH tunnel is not possible.

DBeaver connection:

```txt
Host: 168.110.198.88
Port: 5432
Database: wwjcar
Username: wwjcar_app
Password: production database password
SSL mode: prefer
```

Connection URL:

```txt
jdbc:postgresql://168.110.198.88:5432/wwjcar?sslmode=prefer
```

## PostgreSQL Remote Access Config

Only if direct DBeaver access is required:

1. Find config paths:

```bash
sudo -u postgres psql -c "SHOW config_file;"
sudo -u postgres psql -c "SHOW hba_file;"
```

2. In `postgresql.conf`, verify or set:

```conf
listen_addresses = 'localhost,168.110.198.88'
```

3. In `pg_hba.conf`, add one trusted IP only:

```conf
host    wwjcar    wwjcar_app    TRUSTED_PUBLIC_IP/32    scram-sha-256
```

4. Reload PostgreSQL:

```bash
sudo systemctl reload postgresql
```

## Firewall

Allow only the trusted IP:

```bash
chmod +x deployment/postgres/allow-postgres-trusted-ip.sh
deployment/postgres/allow-postgres-trusted-ip.sh TRUSTED_PUBLIC_IP
```

Verify:

```bash
sudo ufw status verbose
ss -lntp | grep 5432
```

## Backup

Custom format backup:

```bash
PGPASSWORD='production-db-password' pg_dump \
  -h 127.0.0.1 \
  -p 5432 \
  -U wwjcar_app \
  -d wwjcar \
  --format=custom \
  --no-owner \
  --no-acl \
  --file=/home/ubuntu/infra/backups/wwjcar/wwjcar-$(date +%Y%m%d-%H%M%S).dump
```

Plain SQL backup:

```bash
PGPASSWORD='production-db-password' pg_dump \
  -h 127.0.0.1 \
  -p 5432 \
  -U wwjcar_app \
  -d wwjcar \
  --no-owner \
  --no-acl \
  --file=/home/ubuntu/infra/backups/wwjcar/wwjcar-$(date +%Y%m%d-%H%M%S).sql
```

## Restore

Custom format:

```bash
PGPASSWORD='production-db-password' pg_restore \
  -h 127.0.0.1 \
  -p 5432 \
  -U wwjcar_app \
  -d wwjcar \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  /home/ubuntu/infra/backups/wwjcar/wwjcar-YYYYMMDD-HHMMSS.dump
```

Plain SQL:

```bash
PGPASSWORD='production-db-password' psql \
  -h 127.0.0.1 \
  -p 5432 \
  -U wwjcar_app \
  -d wwjcar \
  -f /home/ubuntu/infra/backups/wwjcar/wwjcar-YYYYMMDD-HHMMSS.sql
```

## Security Recommendations

- Prefer SSH tunnel over direct PostgreSQL exposure.
- Keep `5432` blocked globally.
- Allow direct `5432` only from one trusted public IP.
- Rotate the `wwjcar_app` password after sharing temporary DBeaver access.
- Do not use the `postgres` superuser in DBeaver.
- Do not store production passwords in screenshots or tickets.
- Enable SSL for PostgreSQL if direct remote access will be permanent.
