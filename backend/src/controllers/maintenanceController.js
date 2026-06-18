import { auditRepository } from '../repositories/auditRepository.js';
import { maintenanceRepository } from '../repositories/maintenanceRepository.js';
import { HttpError, notFound } from '../utils/httpError.js';

function normalizeDate(value) {
  return String(value || '').slice(0, 10);
}

function assertDateRange(startDate, endDate) {
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    throw new HttpError(422, 'Valid startDate and endDate are required');
  }
  if (end < start) throw new HttpError(422, 'endDate must be after or equal startDate');
}

function toPayload(body) {
  const payload = {
    vehicleId: Number(body.vehicleId || body.vehicle_id),
    startDate: normalizeDate(body.startDate || body.start_date),
    endDate: normalizeDate(body.endDate || body.end_date),
    reason: body.reason || '',
    status: body.status || 'maintenance'
  };
  assertDateRange(payload.startDate, payload.endDate);
  return payload;
}

function setPaginationHeaders(response, result) {
  response.set('X-Total-Count', String(result.total));
  response.set('X-Page', String(result.page));
  response.set('X-Page-Size', String(result.pageSize));
}

export const maintenanceController = {
  async list(request, response) {
    const result = await maintenanceRepository.list(request.query);
    setPaginationHeaders(response, result);
    response.json(result.items);
  },

  async get(request, response) {
    const record = await maintenanceRepository.findById(request.params.id);
    if (!record) throw notFound('Maintenance record not found');
    response.json(record);
  },

  async create(request, response) {
    const record = await maintenanceRepository.create(toPayload(request.body));
    await auditRepository.create({ user: request.user, action: 'create', entityType: 'maintenance', entityId: record.id, request });
    response.status(201).json(record);
  },

  async update(request, response) {
    const existing = await maintenanceRepository.findById(request.params.id);
    if (!existing) throw notFound('Maintenance record not found');

    const record = await maintenanceRepository.update(request.params.id, toPayload(request.body));
    await auditRepository.create({ user: request.user, action: 'update', entityType: 'maintenance', entityId: request.params.id, request });
    response.json(record);
  },

  async delete(request, response) {
    const deleted = await maintenanceRepository.delete(request.params.id);
    if (!deleted) throw notFound('Maintenance record not found');

    await auditRepository.create({ user: request.user, action: 'delete', entityType: 'maintenance', entityId: request.params.id, request });
    response.json({ success: true, id: Number(request.params.id) });
  }
};
