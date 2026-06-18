import { pool } from '../db/pool.js';
import { parseJson, toJson } from '../utils/rowUtils.js';

function mapCondition(row) {
  return {
    id: row.id,
    sectionKey: row.section_key,
    title: row.title,
    content: parseJson(row.content_json, {}),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const rentalConditionsRepository = {
  async list() {
    const [rows] = await pool.query('SELECT * FROM rental_conditions ORDER BY sort_order ASC, id ASC');
    return rows.map(mapCondition);
  },

  async create(payload) {
    const [insertRows] = await pool.query(
      'INSERT INTO rental_conditions (section_key, title, content_json, sort_order) VALUES (?, ?, ?, ?) RETURNING id',
      [payload.sectionKey, payload.title, toJson(payload.content, {}), Number(payload.sortOrder) || 0]
    );
    const [rows] = await pool.query('SELECT * FROM rental_conditions WHERE id = ?', [insertRows[0].id]);
    return mapCondition(rows[0]);
  },

  async update(id, payload) {
    await pool.query(
      'UPDATE rental_conditions SET section_key = ?, title = ?, content_json = ?, sort_order = ? WHERE id = ?',
      [payload.sectionKey, payload.title, toJson(payload.content, {}), Number(payload.sortOrder) || 0, id]
    );
    const [rows] = await pool.query('SELECT * FROM rental_conditions WHERE id = ?', [id]);
    return mapCondition(rows[0]);
  },

  async delete(id) {
    await pool.query('DELETE FROM rental_conditions WHERE id = ?', [id]);
  }
};
