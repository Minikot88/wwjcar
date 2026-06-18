# WWJ Car Rent Ubuntu Deployment And Rollback Guide

## Nginx Proxy Manager

Create proxy hosts:

```txt
wwjcarrent.com      -> frontend static host or file server
api.wwjcarrent.com  -> http://168.110.198.88:4000
```

Use SSL certificates from Let's Encrypt. Enable:

- Force SSL
- HTTP/2
- Websocket support is not required

If Nginx Proxy Manager runs in Docker and cannot reach host port `4000`, proxy to the Docker host gateway IP instead of `127.0.0.1`.

## Firewall Hardening

Run:

```bash
chmod +x /home/ubuntu/infra/projects/wwjcar/source/deployment/ubuntu/ufw-hardening.sh
/home/ubuntu/infra/projects/wwjcar/source/deployment/ubuntu/ufw-hardening.sh
```

Expected public ports:

```txt
22/tcp
80/tcp
443/tcp
```

Keep these private:

```txt
5432 PostgreSQL
81 Nginx Proxy Manager admin
9000 Portainer
3001 Uptime Kuma
```

If Docker publishes those services publicly, fix the Docker compose bindings to `127.0.0.1:PORT:PORT` or place them on an internal Docker network only.

## PM2

```bash
pm2 status
pm2 logs wwjcar-api
pm2 save
pm2 startup
```

The PM2 app config lives at:

```txt
/home/ubuntu/infra/projects/wwjcar/backend/ecosystem.config.cjs
```

## Uptime Kuma

Add monitor:

```txt
Type: HTTP(s)
Name: WWJ Car Rent API
URL: https://api.wwjcarrent.com/api/health
Expected status: 200
Keyword: ok
Interval: 60 seconds
```

Optional frontend monitor:

```txt
URL: https://wwjcarrent.com
Expected status: 200
```

## Daily Backups

Install systemd timer:

```bash
sudo cp /home/ubuntu/infra/projects/wwjcar/source/deployment/ubuntu/wwjcar-backup.service /etc/systemd/system/
sudo cp /home/ubuntu/infra/projects/wwjcar/source/deployment/ubuntu/wwjcar-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now wwjcar-backup.timer
systemctl list-timers | grep wwjcar
```

Manual backup:

```bash
DATABASE_URL="postgresql://wwjcar_app:strong-password@127.0.0.1:5432/wwjcar" \
/home/ubuntu/infra/projects/wwjcar/source/deployment/ubuntu/backup-wwjcar.sh
```

Backups are stored in:

```txt
/home/ubuntu/infra/backups/wwjcar
```

## Restore

```bash
DATABASE_URL="postgresql://wwjcar_app:strong-password@127.0.0.1:5432/wwjcar" \
/home/ubuntu/infra/projects/wwjcar/source/deployment/ubuntu/restore-wwjcar.sh \
/home/ubuntu/infra/backups/wwjcar/wwjcar-YYYYMMDD-HHMMSS.dump
```

Restart API:

```bash
pm2 restart wwjcar-api
```

## Rollback

1. Stop API:

```bash
pm2 stop wwjcar-api
```

2. Restore previous frontend artifact:

```bash
rsync -a --delete /home/ubuntu/infra/projects/wwjcar/releases/previous/frontend/ /home/ubuntu/infra/projects/wwjcar/frontend/
```

3. Restore database if needed:

```bash
/home/ubuntu/infra/projects/wwjcar/source/deployment/ubuntu/restore-wwjcar.sh /home/ubuntu/infra/backups/wwjcar/<backup>.dump
```

4. Restart:

```bash
pm2 restart wwjcar-api
```

## Production Readiness Checks

```bash
curl -I https://wwjcarrent.com
curl https://api.wwjcarrent.com/api/health
pm2 status
sudo ufw status verbose
ss -lntp | grep -E ':(5432|81|9000|3001|4000)'
```

Expected:

- Frontend returns 200.
- API health returns `{"status":"ok"}`.
- PM2 status is online.
- PostgreSQL is not publicly reachable.
- Admin ports are not publicly reachable.
