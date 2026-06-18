import { pool } from '../db/pool.js';

function mapCategory(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order
  };
}

function mapFaq(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categorySlug: row.category_slug,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const faqsRepository = {
  async list(includeDrafts = false) {
    const [rows] = await pool.query(
      `SELECT faqs.*, faq_categories.name AS category_name, faq_categories.slug AS category_slug
       FROM faqs
       LEFT JOIN faq_categories ON faq_categories.id = faqs.category_id
       ${includeDrafts ? '' : "WHERE faqs.status = 'published'"}
       ORDER BY COALESCE(faq_categories.sort_order, 999), faqs.sort_order ASC, faqs.id ASC`
    );
    return rows.map(mapFaq);
  },

  async categories() {
    const [rows] = await pool.query('SELECT * FROM faq_categories ORDER BY sort_order ASC, id ASC');
    return rows.map(mapCategory);
  },

  async upsertCategory(payload) {
    await pool.query(
      `INSERT INTO faq_categories (id, name, slug, sort_order)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (slug) DO UPDATE
       SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order`,
      [payload.id || null, payload.name, payload.slug, Number(payload.sortOrder) || 0]
    );
  },

  async create(payload) {
    const [insertRows] = await pool.query(
      'INSERT INTO faqs (category_id, question, answer, sort_order, status) VALUES (?, ?, ?, ?, ?) RETURNING id',
      [payload.categoryId || null, payload.question, payload.answer, Number(payload.sortOrder) || 0, payload.status || 'published']
    );
    const [rows] = await pool.query(
      `SELECT faqs.*, faq_categories.name AS category_name, faq_categories.slug AS category_slug
       FROM faqs LEFT JOIN faq_categories ON faq_categories.id = faqs.category_id WHERE faqs.id = ?`,
      [insertRows[0].id]
    );
    return mapFaq(rows[0]);
  },

  async update(id, payload) {
    await pool.query(
      'UPDATE faqs SET category_id = ?, question = ?, answer = ?, sort_order = ?, status = ? WHERE id = ?',
      [payload.categoryId || null, payload.question, payload.answer, Number(payload.sortOrder) || 0, payload.status || 'published', id]
    );
    const [rows] = await pool.query(
      `SELECT faqs.*, faq_categories.name AS category_name, faq_categories.slug AS category_slug
       FROM faqs LEFT JOIN faq_categories ON faq_categories.id = faqs.category_id WHERE faqs.id = ?`,
      [id]
    );
    return mapFaq(rows[0]);
  },

  async delete(id) {
    await pool.query('DELETE FROM faqs WHERE id = ?', [id]);
  }
};
