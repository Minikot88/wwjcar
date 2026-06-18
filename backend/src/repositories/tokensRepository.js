import crypto from 'node:crypto';
import { pool } from '../db/pool.js';

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const tokensRepository = {
  async create({ userId, token, expiresAt }) {
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [userId, hashToken(token), expiresAt]
    );
  },

  async findActive(token) {
    const [rows] = await pool.query(
      `SELECT refresh_tokens.*, users.email, users.name, users.role, users.status
       FROM refresh_tokens
       JOIN users ON users.id = refresh_tokens.user_id
       WHERE refresh_tokens.token_hash = ?
         AND refresh_tokens.revoked_at IS NULL
         AND refresh_tokens.expires_at > CURRENT_TIMESTAMP
       LIMIT 1`,
      [hashToken(token)]
    );

    return rows[0] || null;
  },

  async revoke(token) {
    await pool.query('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ?', [hashToken(token)]);
  },

  async revokeUserTokens(userId) {
    await pool.query('UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL', [userId]);
  }
};
