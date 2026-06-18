import { pool } from '../db/pool.js';

function mapBackup(row) {
  return {
    id: row.id,
    fileName: row.file_name,
    filePath: row.file_path,
    sizeBytes: row.size_bytes,
    status: row.status,
    errorMessage: row.error_message,
    createdBy: row.created_by,
    createdAt: row.created_at
  };
}

export const backupsRepository = {
  async create(payload) {
    const [rows] = await pool.query(
      `INSERT INTO database_backups (file_name, file_path, size_bytes, status, error_message, created_by)
       VALUES (?, ?, ?, ?, ?, ?)
       RETURNING id`,
      [
        payload.fileName,
        payload.filePath,
        payload.sizeBytes || 0,
        payload.status || 'completed',
        payload.errorMessage || null,
        payload.createdBy || null
      ]
    );
    return this.findById(rows[0].id);
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM database_backups WHERE id = ? LIMIT 1', [id]);
    return mapBackup(rows[0]);
  },

  async list(limit = 50) {
    const [rows] = await pool.query('SELECT * FROM database_backups ORDER BY created_at DESC LIMIT ?', [Math.min(Number(limit) || 50, 100)]);
    return rows.map(mapBackup);
  },

  async lastCompleted() {
    const [rows] = await pool.query("SELECT * FROM database_backups WHERE status = 'completed' ORDER BY created_at DESC LIMIT 1");
    return rows[0] ? mapBackup(rows[0]) : null;
  }
};
