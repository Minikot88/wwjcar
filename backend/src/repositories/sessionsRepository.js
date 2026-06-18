import { pool } from '../db/pool.js';

function mapSession(row) {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    name: row.name,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    status: row.status
  };
}

export const sessionsRepository = {
  async list(limit = 100) {
    const [rows] = await pool.query('SELECT * FROM admin_sessions_view ORDER BY created_at DESC LIMIT ?', [Math.min(Number(limit) || 100, 200)]);
    return rows.map(mapSession);
  },

  async revoke(id) {
    await pool.query('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
  }
};
