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
    publishedAt: row.published_at,
    updatedBy: row.updated_by,
    updatedByName: row.updated_by_name || null,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const pagesRepository = {
  async list(includeDrafts = false) {
    const where = includeDrafts ? 'pages.deleted_at IS NULL' : "pages.status = 'published' AND pages.deleted_at IS NULL";
    const [rows] = await pool.query(
      `SELECT pages.*, users.name AS updated_by_name
       FROM pages
       LEFT JOIN users ON users.id = pages.updated_by
       WHERE ${where}
       ORDER BY pages.updated_at DESC, pages.slug ASC`
    );
    return rows.map(mapPage);
  },

  async create(payload) {
    const [insertRows] = await pool.query(
      `INSERT INTO pages
       (slug, title, meta_title, meta_description, canonical, og_title, og_description, og_image, schema_json, content_json, status, published_at, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        payload.status || 'draft',
        (payload.status || 'draft') === 'published' ? new Date() : null,
        payload.updatedBy || null
      ]
    );
    const [rows] = await pool.query('SELECT pages.*, users.name AS updated_by_name FROM pages LEFT JOIN users ON users.id = pages.updated_by WHERE pages.id = ?', [insertRows[0].id]);
    return mapPage(rows[0]);
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT pages.*, users.name AS updated_by_name FROM pages LEFT JOIN users ON users.id = pages.updated_by WHERE pages.id = ? AND pages.deleted_at IS NULL LIMIT 1', [id]);
    return rows[0] ? mapPage(rows[0]) : null;
  },

  async findBySlug(slug, includeDrafts = false) {
    const statusClause = includeDrafts ? '' : "AND pages.status = 'published'";
    const [rows] = await pool.query(
      `SELECT pages.*, users.name AS updated_by_name
       FROM pages
       LEFT JOIN users ON users.id = pages.updated_by
       WHERE pages.slug = ? AND pages.deleted_at IS NULL ${statusClause}
       LIMIT 1`,
      [slug]
    );
    return rows[0] ? mapPage(rows[0]) : null;
  },

  async update(id, payload) {
    const current = await this.findById(id);
    if (!current) return null;
    const nextStatus = payload.status || current.status || 'draft';
    const publishedAt = nextStatus === 'published' ? (current.publishedAt || new Date()) : null;
    await pool.query(
      `UPDATE pages SET slug = ?, title = ?, meta_title = ?, meta_description = ?, canonical = ?,
       og_title = ?, og_description = ?, og_image = ?, schema_json = ?, content_json = ?, status = ?, published_at = ?, updated_by = ?
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
        nextStatus,
        publishedAt,
        payload.updatedBy || null,
        id
      ]
    );
    const [rows] = await pool.query('SELECT pages.*, users.name AS updated_by_name FROM pages LEFT JOIN users ON users.id = pages.updated_by WHERE pages.id = ?', [id]);
    return mapPage(rows[0]);
  },

  async updateStatus(id, status, userId = null) {
    const current = await this.findById(id);
    if (!current) return null;
    const publishedAt = status === 'published' ? (current.publishedAt || new Date()) : null;
    const [rows] = await pool.query(
      `UPDATE pages
       SET status = ?, published_at = ?, updated_by = ?
       WHERE id = ? AND deleted_at IS NULL
       RETURNING *`,
      [status, publishedAt, userId, id]
    );
    return rows[0] ? this.findById(rows[0].id) : null;
  },

  async duplicate(id, userId = null) {
    const page = await this.findById(id);
    if (!page) return null;
    const baseSlug = `${page.slug}-copy`;
    let slug = baseSlug;
    let counter = 2;
    while (await this.findBySlug(slug, true)) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return this.create({
      ...page,
      slug,
      title: `${page.title} (สำเนา)`,
      status: 'draft',
      updatedBy: userId
    });
  },

  async updateImage(id, payload) {
    const page = await this.findById(id);
    if (!page) return null;

    if (payload.field === 'content') {
      const content = { ...(page.content || {}) };
      const fieldPath = payload.fieldPath || 'heroImage';
      content[fieldPath] = payload.imageUrl;
      await pool.query('UPDATE pages SET content_json = ?, updated_by = ? WHERE id = ?', [toJson(content, {}), payload.updatedBy || null, id]);
    } else {
      await pool.query('UPDATE pages SET og_image = ?, updated_by = ? WHERE id = ?', [payload.imageUrl, payload.updatedBy || null, id]);
    }

    return this.findById(id);
  },

  async delete(id) {
    await pool.query("UPDATE pages SET deleted_at = CURRENT_TIMESTAMP, status = 'archived' WHERE id = ?", [id]);
  }
};
