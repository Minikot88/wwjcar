import { pool } from '../db/pool.js';
import { parseJson, toJson } from '../utils/rowUtils.js';

function mapAudit(row) {
  return {
    id: row.id,
    actorUserId: row.actor_user_id,
    actorEmail: row.actor_email,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: parseJson(row.metadata, {}),
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: row.created_at
  };
}

export const auditRepository = {
  async create({ user, action, entityType, entityId = null, metadata = {}, request = null }) {
    await pool.query(
      `INSERT INTO audit_logs
       (actor_user_id, actor_email, action, entity_type, entity_id, metadata, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user?.id || null,
        user?.email || null,
        action,
        entityType,
        entityId ? String(entityId) : null,
        toJson(metadata, {}),
        request?.ip || null,
        request?.headers?.['user-agent'] || null
      ]
    );
  },

  async list({ limit = 100, entityType } = {}) {
    const values = [];
    const where = [];
    if (entityType) {
      where.push('entity_type = ?');
      values.push(entityType);
    }
    values.push(Math.min(Math.max(Number(limit) || 100, 1), 250));

    const [rows] = await pool.query(
      `SELECT * FROM audit_logs ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC LIMIT ?`,
      values
    );
    return rows.map(mapAudit);
  }
};
