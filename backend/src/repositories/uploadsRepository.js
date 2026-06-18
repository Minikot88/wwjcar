import { pool } from '../db/pool.js';

function mapUpload(row) {
  if (!row) return null;

  return {
    id: row.id,
    publicId: row.public_id,
    originalName: row.original_name,
    fileName: row.file_name,
    fileUrl: row.file_url,
    secureUrl: row.secure_url,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    bytes: row.bytes ?? row.size_bytes,
    format: row.format,
    resourceType: row.resource_type,
    width: row.width,
    height: row.height,
    usageType: row.usage_type,
    createdBy: row.created_by,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const uploadsRepository = {
  async list() {
    const [rows] = await pool.query('SELECT * FROM uploads WHERE deleted_at IS NULL ORDER BY created_at DESC, id DESC');
    return rows.map(mapUpload);
  },

  async summary() {
    const [rows] = await pool.query(
      `SELECT
        COUNT(*) AS upload_count,
        COALESCE(SUM(COALESCE(bytes, size_bytes, 0)), 0) AS total_bytes,
        MAX(created_at) AS last_upload_at
       FROM uploads
       WHERE deleted_at IS NULL`
    );
    const [lastRows] = await pool.query('SELECT * FROM uploads WHERE deleted_at IS NULL ORDER BY created_at DESC, id DESC LIMIT 1');

    return {
      uploadCount: Number(rows[0]?.upload_count || 0),
      totalBytes: Number(rows[0]?.total_bytes || 0),
      lastUploadAt: rows[0]?.last_upload_at || null,
      lastUpload: mapUpload(lastRows[0])
    };
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM uploads WHERE id = ? LIMIT 1', [id]);
    return mapUpload(rows[0]);
  },

  async create(payload) {
    const [insertRows] = await pool.query(
      `INSERT INTO uploads
       (public_id, original_name, file_name, file_url, secure_url, mime_type, size_bytes, bytes, format, resource_type, width, height, usage_type, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id`,
      [
        payload.publicId || null,
        payload.originalName,
        payload.fileName,
        payload.fileUrl,
        payload.secureUrl || payload.fileUrl,
        payload.mimeType || null,
        payload.sizeBytes || null,
        payload.bytes || payload.sizeBytes || null,
        payload.format || null,
        payload.resourceType || 'image',
        payload.width || null,
        payload.height || null,
        payload.usageType || 'general',
        payload.createdBy || null
      ]
    );
    const [rows] = await pool.query('SELECT * FROM uploads WHERE id = ?', [insertRows[0].id]);
    return mapUpload(rows[0]);
  },

  async replace(id, payload) {
    const current = await this.findById(id);
    const [rows] = await pool.query(
      `UPDATE uploads SET
       public_id = ?,
       original_name = ?,
       file_name = ?,
       file_url = ?,
       secure_url = ?,
       mime_type = ?,
       size_bytes = ?,
       bytes = ?,
       format = ?,
       resource_type = ?,
       width = ?,
       height = ?,
       usage_type = ?,
       deleted_at = NULL
       WHERE id = ?
       RETURNING *`,
      [
        payload.publicId || null,
        payload.originalName,
        payload.fileName,
        payload.fileUrl,
        payload.secureUrl || payload.fileUrl,
        payload.mimeType || null,
        payload.sizeBytes || null,
        payload.bytes || payload.sizeBytes || null,
        payload.format || null,
        payload.resourceType || 'image',
        payload.width || null,
        payload.height || null,
        payload.usageType || 'general',
        id
      ]
    );
    const upload = mapUpload(rows[0]);
    const oldUrl = current?.secureUrl || current?.fileUrl;
    const newUrl = upload?.secureUrl || upload?.fileUrl;

    if (oldUrl && newUrl && oldUrl !== newUrl) {
      await pool.query('UPDATE car_images SET image_url = ? WHERE upload_id = ?', [newUrl, id]);
      await pool.query('UPDATE cars SET cover_image_url = ? WHERE cover_image_url = ?', [newUrl, oldUrl]);
      await pool.query('UPDATE pages SET og_image = ? WHERE og_image = ?', [newUrl, oldUrl]);
      await pool.query('UPDATE pages SET content_json = replace(content_json::text, ?, ?)::jsonb WHERE content_json::text LIKE ?', [oldUrl, newUrl, `%${oldUrl}%`]);
      await pool.query('UPDATE pages SET schema_json = replace(schema_json::text, ?, ?)::jsonb WHERE schema_json IS NOT NULL AND schema_json::text LIKE ?', [oldUrl, newUrl, `%${oldUrl}%`]);
      await pool.query('UPDATE site_settings SET setting_value = replace(setting_value::text, ?, ?)::jsonb WHERE setting_value::text LIKE ?', [oldUrl, newUrl, `%${oldUrl}%`]);
    }

    return upload;
  },

  async referenceCount(upload) {
    if (!upload) return 0;
    const url = upload.secureUrl || upload.fileUrl;
    const [rows] = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM car_images WHERE upload_id = ?) +
        (SELECT COUNT(*) FROM cars WHERE cover_image_url = ?) +
        (SELECT COUNT(*) FROM pages WHERE og_image = ?) +
        (SELECT COUNT(*) FROM pages WHERE content_json::text LIKE ?) +
        (SELECT COUNT(*) FROM pages WHERE schema_json IS NOT NULL AND schema_json::text LIKE ?) +
        (SELECT COUNT(*) FROM site_settings WHERE setting_value::text LIKE ?) AS total`,
      [upload.id, url, url, `%${url}%`, `%${url}%`, `%${url}%`]
    );
    return Number(rows[0]?.total || 0);
  },

  async delete(id) {
    const [rows] = await pool.query('UPDATE uploads SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *', [id]);
    return mapUpload(rows[0]);
  }
};
