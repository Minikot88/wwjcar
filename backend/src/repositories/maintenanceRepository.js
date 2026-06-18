import { pool } from '../db/pool.js';
import { HttpError } from '../utils/httpError.js';

const maintenanceStatuses = ['maintenance', 'returned', 'cancelled'];

function normalizeDate(value) {
  if (value instanceof Date) {
    const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60 * 1000);
    return localDate.toISOString().slice(0, 10);
  }
  return String(value || '').slice(0, 10);
}

function normalizeStatus(status = 'maintenance') {
  return maintenanceStatuses.includes(status) ? status : 'maintenance';
}

function mapMaintenance(row) {
  if (!row) return null;
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    vehicleName: row.vehicle_name,
    vehicleSlug: row.vehicle_slug,
    startDate: normalizeDate(row.start_date),
    endDate: normalizeDate(row.end_date),
    reason: row.reason || '',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function pagination(filters = {}) {
  const page = Math.max(Number(filters.page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(filters.pageSize || filters.limit) || 50, 1), 100);
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function overlapError(error) {
  if (error?.code === '23P01') {
    return new HttpError(409, 'Vehicle is not available for maintenance during the selected date range');
  }
  return error;
}

const maintenanceSelect = `vehicle_maintenance.*,
  cars.name AS vehicle_name,
  cars.slug AS vehicle_slug`;

export const maintenanceRepository = {
  async list(filters = {}) {
    const where = [];
    const values = [];
    const { page, pageSize, offset } = pagination(filters);

    if (filters.vehicleId || filters.vehicle_id) {
      where.push('vehicle_maintenance.vehicle_id = ?');
      values.push(filters.vehicleId || filters.vehicle_id);
    }

    if (filters.status) {
      where.push('vehicle_maintenance.status = ?');
      values.push(normalizeStatus(filters.status));
    }

    if (filters.from && filters.to) {
      where.push('vehicle_maintenance.start_date <= ? AND vehicle_maintenance.end_date >= ?');
      values.push(normalizeDate(filters.to), normalizeDate(filters.from));
    }

    if (filters.search) {
      where.push('(vehicle_maintenance.reason ILIKE ? OR cars.name ILIKE ? OR cars.brand ILIKE ?)');
      const search = `%${filters.search}%`;
      values.push(search, search, search);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT ${maintenanceSelect}
       FROM vehicle_maintenance
       JOIN cars ON cars.id = vehicle_maintenance.vehicle_id
       ${whereSql}
       ORDER BY vehicle_maintenance.start_date DESC, vehicle_maintenance.id DESC
       LIMIT ? OFFSET ?`,
      [...values, pageSize, offset]
    );
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM vehicle_maintenance
       JOIN cars ON cars.id = vehicle_maintenance.vehicle_id
       ${whereSql}`,
      values
    );

    return {
      items: rows.map(mapMaintenance),
      total: Number(countRows[0]?.total || 0),
      page,
      pageSize
    };
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT ${maintenanceSelect}
       FROM vehicle_maintenance
       JOIN cars ON cars.id = vehicle_maintenance.vehicle_id
       WHERE vehicle_maintenance.id = ?
       LIMIT 1`,
      [id]
    );
    return mapMaintenance(rows[0]);
  },

  async create(payload) {
    try {
      const [rows] = await pool.query(
        `INSERT INTO vehicle_maintenance (vehicle_id, start_date, end_date, reason, status)
         VALUES (?, ?, ?, ?, ?)
         RETURNING id`,
        [
          payload.vehicleId,
          normalizeDate(payload.startDate),
          normalizeDate(payload.endDate),
          payload.reason,
          normalizeStatus(payload.status)
        ]
      );
      return this.findById(rows[0].id);
    } catch (error) {
      throw overlapError(error);
    }
  },

  async update(id, payload) {
    try {
      await pool.query(
        `UPDATE vehicle_maintenance
         SET vehicle_id = ?, start_date = ?, end_date = ?, reason = ?, status = ?
         WHERE id = ?`,
        [
          payload.vehicleId,
          normalizeDate(payload.startDate),
          normalizeDate(payload.endDate),
          payload.reason,
          normalizeStatus(payload.status),
          id
        ]
      );
      return this.findById(id);
    } catch (error) {
      throw overlapError(error);
    }
  },

  async delete(id) {
    const [, metadata] = await pool.query('DELETE FROM vehicle_maintenance WHERE id = ?', [id]);
    return metadata.rowCount > 0;
  }
};
