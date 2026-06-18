import { pool } from '../db/pool.js';

function mapReview(row) {
  if (!row) return null;

  return {
    id: row.id,
    customerName: row.customer_name,
    rating: row.rating,
    content: row.content,
    source: row.source,
    imageUploadId: row.image_upload_id,
    imageUrl: row.image_url,
    image: row.image_url,
    sortOrder: row.sort_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const reviewsRepository = {
  async list(includeDrafts = false) {
    const [rows] = await pool.query(`SELECT * FROM reviews ${includeDrafts ? '' : "WHERE status = 'published'"} ORDER BY sort_order ASC, id ASC`);
    return rows.map(mapReview);
  },

  async create(payload) {
    const [insertRows] = await pool.query(
      'INSERT INTO reviews (customer_name, rating, content, source, image_upload_id, image_url, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id',
      [
        payload.customerName,
        Number(payload.rating) || 5,
        payload.content,
        payload.source || null,
        payload.imageUploadId || null,
        payload.imageUrl || payload.image || null,
        Number(payload.sortOrder) || 0,
        payload.status || 'published'
      ]
    );
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [insertRows[0].id]);
    return mapReview(rows[0]);
  },

  async update(id, payload) {
    await pool.query(
      'UPDATE reviews SET customer_name = ?, rating = ?, content = ?, source = ?, image_upload_id = ?, image_url = ?, sort_order = ?, status = ? WHERE id = ?',
      [
        payload.customerName,
        Number(payload.rating) || 5,
        payload.content,
        payload.source || null,
        payload.imageUploadId || null,
        payload.imageUrl || payload.image || null,
        Number(payload.sortOrder) || 0,
        payload.status || 'published',
        id
      ]
    );
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
    return mapReview(rows[0]);
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ? LIMIT 1', [id]);
    return mapReview(rows[0]);
  },

  async setImage(id, upload) {
    const [rows] = await pool.query(
      'UPDATE reviews SET image_upload_id = ?, image_url = ? WHERE id = ? RETURNING *',
      [upload.id, upload.secureUrl || upload.fileUrl, id]
    );
    return mapReview(rows[0]);
  },

  async delete(id) {
    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
  }
};
