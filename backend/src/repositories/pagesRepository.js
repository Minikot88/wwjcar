import { pool } from '../db/pool.js';
import { parseJson, toJson } from '../utils/rowUtils.js';

function mapPage(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    canonical: row.canonical,
    ogTitle: row.og_title,
    ogDescription: row.og_description,
    ogImage: row.og_image,
    schema: parseJson(row.schema_json, null),
    content: parseJson(row.content_json, {}),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const pagesRepository = {
  async list(includeDrafts = false) {
    const [rows] = await pool.query(`SELECT * FROM pages ${includeDrafts ? '' : "WHERE status = 'published'"} ORDER BY slug ASC`);
    return rows.map(mapPage);
  },

  async create(payload) {
    const [insertRows] = await pool.query(
      `INSERT INTO pages
       (slug, title, meta_title, meta_description, canonical, og_title, og_description, og_image, schema_json, content_json, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id`,
      [
        payload.slug,
        payload.title,
        payload.metaTitle || null,
        payload.metaDescription || null,
        payload.canonical || null,
        payload.ogTitle || null,
        payload.ogDescription || null,
        payload.ogImage || null,
        toJson(payload.schema, null),
        toJson(payload.content, {}),
        payload.status || 'published'
      ]
    );
    const [rows] = await pool.query('SELECT * FROM pages WHERE id = ?', [insertRows[0].id]);
    return mapPage(rows[0]);
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM pages WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? mapPage(rows[0]) : null;
  },

  async update(id, payload) {
    await pool.query(
      `UPDATE pages SET slug = ?, title = ?, meta_title = ?, meta_description = ?, canonical = ?,
       og_title = ?, og_description = ?, og_image = ?, schema_json = ?, content_json = ?, status = ?
       WHERE id = ?`,
      [
        payload.slug,
        payload.title,
        payload.metaTitle || null,
        payload.metaDescription || null,
        payload.canonical || null,
        payload.ogTitle || null,
        payload.ogDescription || null,
        payload.ogImage || null,
        toJson(payload.schema, null),
        toJson(payload.content, {}),
        payload.status || 'published',
        id
      ]
    );
    const [rows] = await pool.query('SELECT * FROM pages WHERE id = ?', [id]);
    return mapPage(rows[0]);
  },

  async updateImage(id, payload) {
    const page = await this.findById(id);
    if (!page) return null;

    if (payload.field === 'content') {
      const content = { ...(page.content || {}) };
      const fieldPath = payload.fieldPath || 'heroImage';
      content[fieldPath] = payload.imageUrl;
      await pool.query('UPDATE pages SET content_json = ? WHERE id = ?', [toJson(content, {}), id]);
    } else {
      await pool.query('UPDATE pages SET og_image = ? WHERE id = ?', [payload.imageUrl, id]);
    }

    return this.findById(id);
  },

  async delete(id) {
    await pool.query('DELETE FROM pages WHERE id = ?', [id]);
  }
};
