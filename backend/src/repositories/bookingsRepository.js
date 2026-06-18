import { pool } from '../db/pool.js';
import { HttpError } from '../utils/httpError.js';

export const bookingStatuses = ['reserved', 'active', 'returned', 'cancelled', 'maintenance'];
export const activeBookingStatuses = ['reserved', 'active', 'maintenance'];

const bookingSelect = `vehicle_bookings.*,
  cars.name AS vehicle_name,
  cars.slug AS vehicle_slug`;

function normalizeDate(value) {
  if (value instanceof Date) {
    const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60 * 1000);
    return localDate.toISOString().slice(0, 10);
  }
  return String(value || '').slice(0, 10);
}

function normalizeStatus(status = 'reserved') {
  if (status === 'booked') return 'reserved';
  return status || 'reserved';
}

function mapBooking(row) {
  if (!row) return null;
  return {
    id: row.id,
    customerId: row.customer_id,
    vehicleId: row.vehicle_id,
    vehicleName: row.vehicle_name,
    vehicleSlug: row.vehicle_slug,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    phone: row.customer_phone,
    startDate: normalizeDate(row.start_date),
    endDate: normalizeDate(row.end_date),
    status: row.status,
    revenueAmount: Number(row.revenue_amount || 0),
    note: row.note || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function findOrCreateCustomerForBooking(payload) {
  if (payload.customerId) return payload.customerId;

  const phone = payload.customerPhone || payload.phone;
  const name = payload.customerName;
  if (!phone || !name) return null;

  const [existingRows] = await pool.query('SELECT id FROM customers WHERE phone = ? ORDER BY id ASC LIMIT 1', [phone]);
  if (existingRows[0]?.id) return existingRows[0].id;

  const [createdRows] = await pool.query(
    `INSERT INTO customers (name, phone, note, notes)
     VALUES (?, ?, ?, ?)
     RETURNING id`,
    [name, phone, 'Created from booking management', 'Created from booking management']
  );
  return createdRows[0]?.id || null;
}

async function refreshCustomerStats(customerId) {
  if (!customerId) return;
  await pool.query('SELECT refresh_customer_rental_stats(?)', [customerId]);
}

async function resolveRevenueAmount(payload) {
  if (payload.revenueAmount !== undefined && payload.revenueAmount !== null && payload.revenueAmount !== '') {
    return Number(payload.revenueAmount) || 0;
  }

  const [rows] = await pool.query('SELECT price_per_day FROM cars WHERE id = ? LIMIT 1', [payload.vehicleId]);
  const pricePerDay = Number(rows[0]?.price_per_day || 0);
  const start = new Date(`${normalizeDate(payload.startDate)}T00:00:00.000Z`);
  const end = new Date(`${normalizeDate(payload.endDate)}T00:00:00.000Z`);
  const days = Math.max(Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1, 1);
  return pricePerDay * days;
}

function pagination(filters = {}) {
  const page = Math.max(Number(filters.page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(filters.pageSize || filters.limit) || 50, 1), 100);
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function overlapError(error) {
  if (error?.code === '23P01') {
    return new HttpError(409, 'Vehicle is not available for the selected date range');
  }
  return error;
}

export const bookingsRepository = {
  async list(filters = {}) {
    const where = [];
    const values = [];
    const { page, pageSize, offset } = pagination(filters);

    if (filters.vehicleId || filters.vehicle_id) {
      where.push('vehicle_bookings.vehicle_id = ?');
      values.push(filters.vehicleId || filters.vehicle_id);
    }

    if (filters.status) {
      where.push('vehicle_bookings.status = ?');
      values.push(normalizeStatus(filters.status));
    }

    if (filters.from && filters.to) {
      where.push('vehicle_bookings.start_date <= ? AND vehicle_bookings.end_date >= ?');
      values.push(normalizeDate(filters.to), normalizeDate(filters.from));
    }

    if (filters.startDate || filters.start_date) {
      where.push('vehicle_bookings.end_date >= ?');
      values.push(normalizeDate(filters.startDate || filters.start_date));
    }

    if (filters.endDate || filters.end_date) {
      where.push('vehicle_bookings.start_date <= ?');
      values.push(normalizeDate(filters.endDate || filters.end_date));
    }

    if (filters.search) {
      where.push(`(
        vehicle_bookings.customer_name ILIKE ?
        OR vehicle_bookings.customer_phone ILIKE ?
        OR vehicle_bookings.note ILIKE ?
        OR cars.name ILIKE ?
        OR cars.brand ILIKE ?
      )`);
      const search = `%${filters.search}%`;
      values.push(search, search, search, search, search);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT ${bookingSelect}
       FROM vehicle_bookings
       JOIN cars ON cars.id = vehicle_bookings.vehicle_id
       ${whereSql}
       ORDER BY vehicle_bookings.start_date DESC, vehicle_bookings.id DESC
       LIMIT ? OFFSET ?`,
      [...values, pageSize, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM vehicle_bookings
       JOIN cars ON cars.id = vehicle_bookings.vehicle_id
       ${whereSql}`,
      values
    );

    return {
      items: rows.map(mapBooking),
      total: Number(countRows[0]?.total || 0),
      page,
      pageSize
    };
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT ${bookingSelect}
       FROM vehicle_bookings
       JOIN cars ON cars.id = vehicle_bookings.vehicle_id
       WHERE vehicle_bookings.id = ?
       LIMIT 1`,
      [id]
    );
    return mapBooking(rows[0]);
  },

  async create(payload) {
    try {
      const customerId = await findOrCreateCustomerForBooking(payload);
      const revenueAmount = await resolveRevenueAmount(payload);
      const [rows] = await pool.query(
        `INSERT INTO vehicle_bookings (vehicle_id, customer_id, customer_name, customer_phone, start_date, end_date, status, revenue_amount, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING id`,
        [
          payload.vehicleId,
          customerId,
          payload.customerName,
          payload.customerPhone || payload.phone,
          normalizeDate(payload.startDate),
          normalizeDate(payload.endDate),
          normalizeStatus(payload.status),
          revenueAmount,
          payload.note || null
        ]
      );
      await refreshCustomerStats(customerId);
      return this.findById(rows[0].id);
    } catch (error) {
      throw overlapError(error);
    }
  },

  async update(id, payload) {
    try {
      const existing = await this.findById(id);
      const customerId = await findOrCreateCustomerForBooking(payload);
      const revenueAmount = await resolveRevenueAmount(payload);
      await pool.query(
        `UPDATE vehicle_bookings
         SET vehicle_id = ?, customer_id = ?, customer_name = ?, customer_phone = ?, start_date = ?, end_date = ?, status = ?, revenue_amount = ?, note = ?
         WHERE id = ?`,
        [
          payload.vehicleId,
          customerId,
          payload.customerName,
          payload.customerPhone || payload.phone,
          normalizeDate(payload.startDate),
          normalizeDate(payload.endDate),
          normalizeStatus(payload.status),
          revenueAmount,
          payload.note || null,
          id
        ]
      );
      await refreshCustomerStats(existing?.customerId);
      await refreshCustomerStats(customerId);
      return this.findById(id);
    } catch (error) {
      throw overlapError(error);
    }
  },

  async updateStatus(id, status) {
    try {
      const existing = await this.findById(id);
      await pool.query('UPDATE vehicle_bookings SET status = ? WHERE id = ?', [normalizeStatus(status), id]);
      await refreshCustomerStats(existing?.customerId);
      return this.findById(id);
    } catch (error) {
      throw overlapError(error);
    }
  },

  async delete(id) {
    const existing = await this.findById(id);
    const [, metadata] = await pool.query('DELETE FROM vehicle_bookings WHERE id = ?', [id]);
    await refreshCustomerStats(existing?.customerId);
    return metadata.rowCount > 0;
  },

  async overlappingBookings({ startDate, endDate, vehicleId = null, excludeId = null }) {
    const values = [normalizeDate(endDate), normalizeDate(startDate)];
    const filters = [];

    if (vehicleId) {
      filters.push('vehicle_bookings.vehicle_id = ?');
      values.push(vehicleId);
    }

    if (excludeId) {
      filters.push('vehicle_bookings.id <> ?');
      values.push(excludeId);
    }

    const filterSql = filters.length ? `AND ${filters.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT ${bookingSelect}
       FROM vehicle_bookings
       JOIN cars ON cars.id = vehicle_bookings.vehicle_id
       WHERE vehicle_bookings.status IN ('reserved', 'active', 'maintenance')
       AND vehicle_bookings.start_date <= ?
       AND vehicle_bookings.end_date >= ?
       ${filterSql}
       ORDER BY vehicle_bookings.start_date ASC`,
      values
    );
    return rows.map(mapBooking);
  },

  async overlappingMaintenance({ startDate, endDate, vehicleId = null }) {
    const values = [normalizeDate(endDate), normalizeDate(startDate)];
    const vehicleSql = vehicleId ? 'AND vehicle_maintenance.vehicle_id = ?' : '';
    if (vehicleId) values.push(vehicleId);

    const [rows] = await pool.query(
      `SELECT vehicle_maintenance.*,
        cars.name AS vehicle_name,
        cars.slug AS vehicle_slug
       FROM vehicle_maintenance
       JOIN cars ON cars.id = vehicle_maintenance.vehicle_id
       WHERE vehicle_maintenance.status = 'maintenance'
       AND vehicle_maintenance.start_date <= ?
       AND vehicle_maintenance.end_date >= ?
       ${vehicleSql}
       ORDER BY vehicle_maintenance.start_date ASC`,
      values
    );

    return rows.map((row) => ({
      id: row.id,
      vehicleId: row.vehicle_id,
      vehicleName: row.vehicle_name,
      vehicleSlug: row.vehicle_slug,
      startDate: normalizeDate(row.start_date),
      endDate: normalizeDate(row.end_date),
      status: row.status,
      reason: row.reason || '',
      source: 'maintenance'
    }));
  },

  async availabilityBlocks({ startDate, endDate, vehicleId = null }) {
    const [bookings, maintenance] = await Promise.all([
      this.overlappingBookings({ startDate, endDate, vehicleId }),
      this.overlappingMaintenance({ startDate, endDate, vehicleId })
    ]);
    return [...bookings.map((booking) => ({ ...booking, source: 'booking' })), ...maintenance];
  },

  async nextAvailableDate(vehicleId, startDate, endDate = startDate) {
    const requestedStart = new Date(`${normalizeDate(startDate)}T00:00:00.000Z`);
    const requestedEnd = new Date(`${normalizeDate(endDate)}T00:00:00.000Z`);
    const rentalDays = Math.max(0, Math.round((requestedEnd - requestedStart) / (24 * 60 * 60 * 1000)));
    const [rows] = await pool.query(
      `SELECT start_date, end_date
       FROM (
         SELECT start_date, end_date
         FROM vehicle_bookings
         WHERE vehicle_id = ?
         AND status IN ('reserved', 'active', 'maintenance')
         AND end_date >= ?
         UNION ALL
         SELECT start_date, end_date
         FROM vehicle_maintenance
         WHERE vehicle_id = ?
         AND status = 'maintenance'
         AND end_date >= ?
       ) AS blocks
       ORDER BY start_date ASC, end_date ASC`,
      [vehicleId, normalizeDate(startDate), vehicleId, normalizeDate(startDate)]
    );

    let candidateStart = requestedStart;

    for (const row of rows) {
      const blockedStart = new Date(`${normalizeDate(row.start_date)}T00:00:00.000Z`);
      const blockedEnd = new Date(`${normalizeDate(row.end_date)}T00:00:00.000Z`);
      const candidateEnd = new Date(candidateStart);
      candidateEnd.setUTCDate(candidateEnd.getUTCDate() + rentalDays);

      if (blockedStart <= candidateEnd && blockedEnd >= candidateStart) {
        candidateStart = new Date(blockedEnd);
        candidateStart.setUTCDate(candidateStart.getUTCDate() + 1);
        continue;
      }

      if (blockedStart > candidateEnd) break;
    }

    return candidateStart.toISOString().slice(0, 10);
  },

  async calendar(vehicleId, year, month) {
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = new Date(Date.UTC(Number(year), Number(month), 1));
    const monthEnd = new Date(nextMonth.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const blocks = await this.availabilityBlocks({ vehicleId, startDate: monthStart, endDate: monthEnd });
    return blocks.sort((a, b) => a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate));
  }
};
