# WWJ Car Rent Disaster Recovery Guide

## Recovery Objectives

- RPO: up to 24 hours, based on daily backups
- RTO: 30 to 90 minutes, depending on server availability and DNS/proxy status

## Critical Assets

- PostgreSQL database `wwjcar`
- Backend `.env`
- Cloudinary account and folder `wwj-car-rent`
- Frontend container `wwjcar-frontend`
- Backend PM2 app `wwjcar-api`
- Nginx Proxy Manager host rules
- Backup directory `/home/ubuntu/infra/backups/wwjcar`

## Incident Types

### Application Failure

1. Check backend health:

```bash
curl -fsS http://127.0.0.1:4000/api/health
pm2 status
pm2 logs wwjcar-api --lines 100
```

2. Restart backend:

```bash
pm2 restart wwjcar-api --update-env
```

3. Check frontend:

```bash
docker ps --filter name=wwjcar-frontend
curl -I http://127.0.0.1:8081/
```

### Database Corruption Or Bad CMS Edit

1. Stop public writes if needed.
2. Choose the newest verified backup.
3. Follow `docs/restore-guide.md`.
4. Verify CMS records and admin login.

### Server Loss

1. Provision Ubuntu 24.04 server.
2. Install Docker, PM2, Node.js, and Nginx Proxy Manager.
3. Restore project files to `/home/ubuntu/infra/projects/wwjcar`.
4. Restore PostgreSQL from latest off-server backup.
5. Recreate `.env` secrets.
6. Restart backend and frontend.
7. Repoint DNS/proxy if IP changed.

## Weekly Restore Rehearsal

Create a temporary database and test restore without touching production:

```bash
LATEST="$(ls -1t /home/ubuntu/infra/backups/wwjcar/wwjcar-*.dump | head -n 1)"
docker exec server-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP DATABASE IF EXISTS wwjcar_restore_test;"
docker exec server-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE DATABASE wwjcar_restore_test;"
docker exec -i server-postgres pg_restore --dbname=wwjcar_restore_test --clean --if-exists --no-owner --no-acl < "$LATEST"
docker exec server-postgres psql -U "$POSTGRES_USER" -d wwjcar_restore_test -c "SELECT COUNT(*) FROM wwjcar.cars;"
docker exec server-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP DATABASE IF EXISTS wwjcar_restore_test;"
```

## Off-Server Backup Recommendation

The server currently stores local backups. Add off-server replication for stronger disaster recovery.

Recommended options:

- Cloud object storage
- Encrypted SFTP target
- Private backup server

Minimum policy:

- Keep 14 daily local backups
- Keep 4 weekly off-server backups
- Keep 3 monthly off-server backups
