import { pool } from '../db/pool.js';
import { parseJson, toJson } from '../utils/rowUtils.js';

function mapSetting(row) {
  return {
    id: row.id,
    key: row.setting_key,
    value: parseJson(row.setting_value, {}),
    updatedAt: row.updated_at
  };
}

export const settingsRepository = {
  async list({ publicOnly = false } = {}) {
    const publicKeys = ['contact', 'brand', 'home', 'about', 'seoDefaults'];
    const [rows] = publicOnly
      ? await pool.query('SELECT * FROM site_settings WHERE setting_key = ANY(?::text[]) ORDER BY setting_key ASC', [publicKeys])
      : await pool.query('SELECT * FROM site_settings ORDER BY setting_key ASC');
    return rows.map(mapSetting);
  },

  async upsert(key, value) {
    await pool.query(
      `INSERT INTO site_settings (setting_key, setting_value)
       VALUES (?, ?)
       ON CONFLICT (setting_key) DO UPDATE
       SET setting_value = EXCLUDED.setting_value`,
      [key, toJson(value, {})]
    );
    const [rows] = await pool.query('SELECT * FROM site_settings WHERE setting_key = ?', [key]);
    return mapSetting(rows[0]);
  },

  async updateImage(key, payload) {
    const [rows] = await pool.query('SELECT * FROM site_settings WHERE setting_key = ? LIMIT 1', [key]);
    const current = rows[0] ? parseJson(rows[0].setting_value, {}) : {};
    const fieldPath = payload.fieldPath || 'image';
    const next = { ...current, [fieldPath]: payload.imageUrl };
    return this.upsert(key, next);
  }
};
