# WWJ Car Rent Backup Report

## Scope

This report covers the PostgreSQL backup system for the production WWJ Car Rent deployment.

## Current Backup Design

- Database: PostgreSQL in Docker container `server-postgres`
- Backup path: `/home/ubuntu/infra/backups/wwjcar`
- Backup script: `/home/ubuntu/infra/projects/wwjcar/source/deployment/ubuntu/backup-wwjcar.sh`
- Restore script: `/home/ubuntu/infra/projects/wwjcar/source/deployment/ubuntu/restore-wwjcar.sh`
- Scheduler: `wwjcar-backup.timer`
- Schedule: daily at `02:30 UTC`
- Retention: `14` days by default, configurable with `BACKUP_RETENTION_DAYS`
- Backup format: PostgreSQL custom format dump

## Verification

Each backup is verified immediately after creation with:

```bash
pg_restore --list /home/ubuntu/infra/backups/wwjcar/wwjcar-YYYYMMDDTHHMMSSZ.dump
```

If host `pg_restore` is unavailable, verification falls back to the PostgreSQL Docker container.

## Database Tracking

Successful and failed backups are recorded in:

```sql
wwjcar.database_backups
```

This allows the Admin Operations Dashboard to show last backup time and backup health.

## Retention Policy

The backup job deletes dump files older than the configured retention window:

```bash
find "$BACKUP_DIR" -type f -name "wwjcar-*.dump" -mtime +"$BACKUP_RETENTION_DAYS" -delete
```

Default retention is 14 days.

## Audit Result

- Daily timer: enabled and active
- Backup directory: present
- Backup format: valid custom PostgreSQL dump
- Retention: implemented
- Verification: implemented
- Dashboard tracking: implemented

## Recommended Operating Cadence

- Daily: automated backup at `02:30 UTC`
- Weekly: perform restore rehearsal to a temporary database
- Monthly: copy at least one backup to off-server storage
- Before releases: run manual backup from Admin Operations or CLI
