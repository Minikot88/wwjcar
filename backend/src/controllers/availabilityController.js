import { auditRepository } from '../repositories/auditRepository.js';
import { bookingsRepository, bookingStatuses } from '../repositories/bookingsRepository.js';
import { carsRepository } from '../repositories/carsRepository.js';
import { HttpError, notFound } from '../utils/httpError.js';

function normalizeDate(value) {
  return String(value || '').slice(0, 10);
}

function normalizeStatus(status = 'reserved') {
  if (status === 'booked') return 'reserved';
  return status || 'reserved';
}

function assertDateRange(startDate, endDate) {
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    throw new HttpError(422, 'Valid startDate and endDate are required');
  }
  if (end < start) throw new HttpError(422, 'endDate must be after or equal startDate');
}

function assertStatus(status) {
  if (!bookingStatuses.includes(normalizeStatus(status))) {
    throw new HttpError(422, `status must be one of: ${bookingStatuses.join(', ')}`);
  }
}

function toPayload(body) {
  const payload = {
    vehicleId: Number(body.vehicleId || body.vehicle_id),
    customerId: body.customerId || body.customer_id ? Number(body.customerId || body.customer_id) : null,
    customerName: body.customerName || body.customer_name,
    customerPhone: body.customerPhone || body.customer_phone || body.phone,
    phone: body.customerPhone || body.customer_phone || body.phone,
    startDate: body.startDate || body.start_date,
    endDate: body.endDate || body.end_date,
    status: normalizeStatus(body.status || 'reserved'),
    revenueAmount: body.revenueAmount ?? body.revenue_amount,
    note: body.note || ''
  };

  assertDateRange(payload.startDate, payload.endDate);
  assertStatus(payload.status);

  return payload;
}

function setPaginationHeaders(response, result) {
  response.set('X-Total-Count', String(result.total));
  response.set('X-Page', String(result.page));
  response.set('X-Page-Size', String(result.pageSize));
}

export const availabilityController = {
  async availability(request, response) {
    const startDate = normalizeDate(request.query.startDate || request.query.start_date);
    const endDate = normalizeDate(request.query.endDate || request.query.end_date);
    assertDateRange(startDate, endDate);

    const [{ items: cars }, blocks] = await Promise.all([
      carsRepository.list({ includeDrafts: false, pageSize: 100 }),
      bookingsRepository.availabilityBlocks({ startDate, endDate })
    ]);

    const blockedByVehicle = new Map();
    blocks.forEach((block) => {
      const key = String(block.vehicleId);
      if (!blockedByVehicle.has(key)) blockedByVehicle.set(key, []);
      blockedByVehicle.get(key).push(block);
    });

    const availableVehicles = [];
    const unavailableVehicles = [];

    for (const car of cars) {
      const blockingItems = blockedByVehicle.get(String(car.id)) || [];
      if (blockingItems.length === 0) {
        availableVehicles.push(car);
      } else {
        unavailableVehicles.push({
          ...car,
          blockingBookings: blockingItems,
          nextAvailableDate: await bookingsRepository.nextAvailableDate(car.id, startDate, endDate)
        });
      }
    }

    response.json({ startDate, endDate, availableVehicles, unavailableVehicles });
  },

  async calendar(request, response) {
    const year = Number(request.query.year) || new Date().getFullYear();
    const month = Number(request.query.month) || new Date().getMonth() + 1;
    if (month < 1 || month > 12) throw new HttpError(422, 'month must be between 1 and 12');

    const bookings = await bookingsRepository.calendar(request.params.id, year, month);
    response.json({ vehicleId: request.params.id, year, month, bookings });
  },

  async listBookings(request, response) {
    const result = await bookingsRepository.list(request.query);
    setPaginationHeaders(response, result);
    response.json(result.items);
  },

  async getBooking(request, response) {
    const booking = await bookingsRepository.findById(request.params.id);
    if (!booking) throw notFound('Booking not found');
    response.json(booking);
  },

  async createBooking(request, response) {
    const payload = toPayload(request.body);
    const booking = await bookingsRepository.create(payload);
    await auditRepository.create({ user: request.user, action: 'create', entityType: 'booking', entityId: booking.id, request });
    response.status(201).json(booking);
  },

  async updateBooking(request, response) {
    const existing = await bookingsRepository.findById(request.params.id);
    if (!existing) throw notFound('Booking not found');

    const payload = toPayload(request.body);
    const booking = await bookingsRepository.update(request.params.id, payload);
    await auditRepository.create({ user: request.user, action: 'update', entityType: 'booking', entityId: request.params.id, request });
    response.json(booking);
  },

  async deleteBooking(request, response) {
    const deleted = await bookingsRepository.delete(request.params.id);
    if (!deleted) throw notFound('Booking not found');

    await auditRepository.create({ user: request.user, action: 'delete', entityType: 'booking', entityId: request.params.id, request });
    response.json({ success: true, id: Number(request.params.id) });
  },

  async markReturned(request, response) {
    const booking = await bookingsRepository.updateStatus(request.params.id, 'returned');
    if (!booking) throw notFound('Booking not found');

    await auditRepository.create({ user: request.user, action: 'returned', entityType: 'booking', entityId: request.params.id, request });
    response.json(booking);
  },

  async markCancelled(request, response) {
    const booking = await bookingsRepository.updateStatus(request.params.id, 'cancelled');
    if (!booking) throw notFound('Booking not found');

    await auditRepository.create({ user: request.user, action: 'cancelled', entityType: 'booking', entityId: request.params.id, request });
    response.json(booking);
  }
};
