import bcrypt from 'bcryptjs';
import { execFile, spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { pingDatabase, pool } from '../db/pool.js';
import { auditRepository } from '../repositories/auditRepository.js';
import { backupsRepository } from '../repositories/backupsRepository.js';
import { sessionsRepository } from '../repositories/sessionsRepository.js';
import { uploadsRepository } from '../repositories/uploadsRepository.js';
import { usersRepository } from '../repositories/usersRepository.js';
import { HttpError } from '../utils/httpError.js';

const execFileAsync = promisify(execFile);

async function getDiskUsage() {
  if (!fs.statfs) return { available: null, total: null, usedPercent: null };
  const stat = await fs.statfs(env.backups.dir);
  const available = Number(stat.bavail) * Number(stat.bsize);
  const total = Number(stat.blocks) * Number(stat.bsize);
  const usedPercent = total > 0 ? Math.round(((total - available) / total) * 100) : null;
  return { available, total, usedPercent };
}

async function checkCloudinary() {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    return { status: 'not_configured' };
  }

  await cloudinary.api.ping();
  const result = { status: 'ok' };

  try {
    const usage = await cloudinary.api.usage();
    result.storage = {
      usedBytes: usage.storage?.usage || null,
      limitBytes: usage.storage?.limit || null,
      usedPercent: usage.storage?.usage && usage.storage?.limit
        ? Math.round((usage.storage.usage / usage.storage.limit) * 100)
        : null
    };
    result.credits = usage.credits ? {
      used: usage.credits.usage,
      limit: usage.credits.limit,
      usedPercent: usage.credits.usage && usage.credits.limit
        ? Math.round((usage.credits.usage / usage.credits.limit) * 100)
        : null
    } : null;
  } catch (error) {
    result.message = `Connected. Usage unavailable: ${error.message}`;
  }

  return result;
}

function getMemoryUsage() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  return {
    status: 'ok',
    total,
    free,
    used,
    usedPercent: total > 0 ? Math.round((used / total) * 100) : null,
    processRss: process.memoryUsage().rss,
    processHeapUsed: process.memoryUsage().heapUsed
  };
}

function getUptime() {
  return {
    status: 'ok',
    systemSeconds: Math.floor(os.uptime()),
    processSeconds: Math.floor(process.uptime()),
    startedAt: new Date(Date.now() - process.uptime() * 1000).toISOString()
  };
}

function getBackupStatus(lastBackup) {
  if (!lastBackup) return { status: 'unknown', message: 'No completed backups recorded' };
  const lastBackupTime = new Date(lastBackup.createdAt).getTime();
  const ageHours = Number.isFinite(lastBackupTime) ? Math.round((Date.now() - lastBackupTime) / 1000 / 60 / 60) : null;
  return {
    status: ageHours != null && ageHours <= 36 ? 'ok' : 'warning',
    lastBackupTime: lastBackup.createdAt,
    ageHours,
    fileName: lastBackup.fileName,
    sizeBytes: lastBackup.sizeBytes
  };
}

async function runDockerPgDump(filePath) {
  await new Promise((resolve, reject) => {
    const output = createWriteStream(filePath);
    const child = spawn('docker', [
      'exec',
      env.docker.postgresContainer,
      'pg_dump',
      env.database.url,
      '--format=custom',
      '--no-owner',
      '--no-acl'
    ]);

    child.stdout.pipe(output);
    child.stderr.on('data', (chunk) => {
      process.stderr.write(chunk);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      output.close();
      if (code === 0) resolve();
      else reject(new Error(`Docker pg_dump failed with code ${code}`));
    });
  });
}

async function runDockerPgRestoreList(filePath) {
  await new Promise((resolve, reject) => {
    const child = spawn('docker', [
      'exec',
      '-i',
      env.docker.postgresContainer,
      'pg_restore',
      '--list'
    ]);

    fs.open(filePath, 'r')
      .then((handle) => {
        const stream = handle.createReadStream();
        stream.pipe(child.stdin);
        child.on('close', () => handle.close());
      })
      .catch(reject);

    child.stderr.on('data', (chunk) => {
      process.stderr.write(chunk);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Docker pg_restore verification failed with code ${code}`));
    });
  });
}

async function runPgDump(filePath) {
  try {
    await execFileAsync('pg_dump', [
      env.database.url,
      '--format=custom',
      '--no-owner',
      '--no-acl',
      `--file=${filePath}`
    ]);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await runDockerPgDump(filePath);
  }
}

async function verifyPgDump(filePath) {
  try {
    await execFileAsync('pg_restore', ['--list', filePath]);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await runDockerPgRestoreList(filePath);
  }
}

function backupFileName() {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `wwjcar-${stamp}.dump`;
}

export const operationsController = {
  async health(_request, response) {
    const checks = {
      api: { status: 'ok' },
      database: { status: 'unknown' },
      cloudinary: { status: 'unknown' },
      uploads: await uploadsRepository.summary(),
      disk: { status: 'unknown' },
      memory: getMemoryUsage(),
      uptime: getUptime(),
      lastBackup: await backupsRepository.lastCompleted()
    };
    checks.backup = getBackupStatus(checks.lastBackup);

    try {
      await pingDatabase();
      checks.database = { status: 'ok' };
    } catch (error) {
      checks.database = { status: 'error', message: error.message };
    }

    try {
      checks.cloudinary = await checkCloudinary();
    } catch (error) {
      checks.cloudinary = { status: 'error', message: error.message };
    }

    try {
      checks.disk = { status: 'ok', ...(await getDiskUsage()) };
    } catch (error) {
      checks.disk = { status: 'error', message: error.message };
    }

    response.json({
      status: checks.database.status === 'ok' ? 'ok' : 'degraded',
      checks
    });
  },

  async auditLogs(request, response) {
    response.json(await auditRepository.list({ limit: request.query.limit, entityType: request.query.entityType }));
  },

  async backups(_request, response) {
    response.json(await backupsRepository.list());
  },

  async createBackup(request, response) {
    await fs.mkdir(env.backups.dir, { recursive: true });
    const fileName = backupFileName();
    const filePath = path.join(env.backups.dir, fileName);

    try {
      await runPgDump(filePath);
      await verifyPgDump(filePath);
      const stat = await fs.stat(filePath);
      const backup = await backupsRepository.create({
        fileName,
        filePath,
        sizeBytes: stat.size,
        status: 'completed',
        createdBy: request.user.id
      });
      await auditRepository.create({ user: request.user, action: 'create', entityType: 'backup', entityId: backup.id, request });
      response.status(201).json(backup);
    } catch (error) {
      const backup = await backupsRepository.create({
        fileName,
        filePath,
        status: 'failed',
        errorMessage: error.message,
        createdBy: request.user.id
      });
      await auditRepository.create({ user: request.user, action: 'failed', entityType: 'backup', entityId: backup.id, metadata: { message: error.message }, request });
      throw new HttpError(500, 'Backup failed', { message: error.message });
    }
  },

  async downloadBackup(request, response) {
    const backup = await backupsRepository.findById(request.params.id);
    if (!backup || backup.status !== 'completed') throw new HttpError(404, 'Backup not found');
    response.download(backup.filePath, backup.fileName);
  },

  async profile(request, response) {
    response.json({ user: { id: request.user.id, name: request.user.name, email: request.user.email, role: request.user.role } });
  },

  async updateProfile(request, response) {
    await pool.query('UPDATE users SET name = ? WHERE id = ?', [request.body.name, request.user.id]);
    await auditRepository.create({ user: request.user, action: 'update', entityType: 'admin_profile', entityId: request.user.id, request });
    const user = await usersRepository.findById(request.user.id);
    response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  },

  async changePassword(request, response) {
    const user = await usersRepository.findById(request.user.id);
    const isValid = await bcrypt.compare(request.body.currentPassword, user.passwordHash);
    if (!isValid) throw new HttpError(401, 'Current password is incorrect');

    const passwordHash = await bcrypt.hash(request.body.newPassword, 12);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, user.id]);
    await auditRepository.create({ user, action: 'password_change', entityType: 'admin_profile', entityId: user.id, request });
    response.json({ success: true });
  },

  async sessions(_request, response) {
    response.json(await sessionsRepository.list());
  },

  async revokeSession(request, response) {
    await sessionsRepository.revoke(request.params.id);
    await auditRepository.create({ user: request.user, action: 'revoke', entityType: 'session', entityId: request.params.id, request });
    response.json({ success: true });
  }
};
