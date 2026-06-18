import { auditRepository } from '../repositories/auditRepository.js';
import { businessOperationsRepository } from '../repositories/businessOperationsRepository.js';
import { HttpError, notFound } from '../utils/httpError.js';

function sendList(response, result) {
  response.set('X-Total-Count', String(result.total));
  response.set('X-Page', String(result.page));
  response.set('X-Page-Size', String(result.pageSize));
  response.json(result.items);
}

function requireRecord(record, label) {
  if (!record) throw notFound(`${label} not found`);
  return record;
}

function dateRange(startDate, endDate) {
  if (Date.parse(endDate) < Date.parse(startDate)) throw new HttpError(422, 'endDate must be after or equal startDate');
}

export const businessOperationsController = {
  customerSummary: async (_request, response) => response.json(await businessOperationsRepository.customerSummary()),
  customers: async (request, response) => sendList(response, await businessOperationsRepository.customers(request.query)),
  customer: async (request, response) => response.json(requireRecord(await businessOperationsRepository.customer(request.params.id), 'Customer')),
  createCustomer: async (request, response) => {
    const customer = await businessOperationsRepository.createCustomer(request.body);
    await auditRepository.create({ user: request.user, action: 'create', entityType: 'customer', entityId: customer.id, request });
    response.status(201).json(customer);
  },
  updateCustomer: async (request, response) => {
    requireRecord(await businessOperationsRepository.customer(request.params.id), 'Customer');
    const customer = await businessOperationsRepository.updateCustomer(request.params.id, request.body);
    await auditRepository.create({ user: request.user, action: 'update', entityType: 'customer', entityId: request.params.id, request });
    response.json(customer);
  },
  deleteCustomer: async (request, response) => {
    const deleted = await businessOperationsRepository.deleteCustomer(request.params.id);
    if (!deleted) throw notFound('Customer not found');
    await auditRepository.create({ user: request.user, action: 'delete', entityType: 'customer', entityId: request.params.id, request });
    response.json({ success: true, id: Number(request.params.id) });
  },
  customerNotes: async (request, response) => response.json(await businessOperationsRepository.customerNotes(request.params.id)),
  customerHistory: async (request, response) => response.json(await businessOperationsRepository.customerHistory(request.params.id)),
  createCustomerNote: async (request, response) => {
    const note = await businessOperationsRepository.addCustomerNote(request.params.id, request.body.note, request.user?.id);
    await auditRepository.create({ user: request.user, action: 'note', entityType: 'customer', entityId: request.params.id, request });
    response.status(201).json(note);
  },

  contracts: async (request, response) => sendList(response, await businessOperationsRepository.contracts(request.query)),
  contract: async (request, response) => response.json(requireRecord(await businessOperationsRepository.contract(request.params.id), 'Contract')),
  createContract: async (request, response) => {
    dateRange(request.body.startDate, request.body.endDate);
    const contract = await businessOperationsRepository.createContract(request.body);
    await auditRepository.create({ user: request.user, action: 'create', entityType: 'contract', entityId: contract.id, request });
    response.status(201).json(contract);
  },
  updateContract: async (request, response) => {
    requireRecord(await businessOperationsRepository.contract(request.params.id), 'Contract');
    dateRange(request.body.startDate, request.body.endDate);
    const contract = await businessOperationsRepository.updateContract(request.params.id, request.body);
    await auditRepository.create({ user: request.user, action: 'update', entityType: 'contract', entityId: request.params.id, request });
    response.json(contract);
  },
  deleteContract: async (request, response) => {
    const deleted = await businessOperationsRepository.deleteContract(request.params.id);
    if (!deleted) throw notFound('Contract not found');
    await auditRepository.create({ user: request.user, action: 'delete', entityType: 'contract', entityId: request.params.id, request });
    response.json({ success: true, id: Number(request.params.id) });
  },
  createAttachment: async (request, response) => {
    requireRecord(await businessOperationsRepository.contract(request.params.id), 'Contract');
    const attachment = await businessOperationsRepository.createAttachment(request.params.id, request.body);
    await auditRepository.create({ user: request.user, action: 'attach', entityType: 'contract', entityId: request.params.id, request });
    response.status(201).json(attachment);
  },

  expenses: async (request, response) => sendList(response, await businessOperationsRepository.expenses(request.query)),
  expenseSummary: async (_request, response) => response.json(await businessOperationsRepository.expenseSummary()),
  expense: async (request, response) => response.json(requireRecord(await businessOperationsRepository.expense(request.params.id), 'Expense')),
  createExpense: async (request, response) => {
    const expense = await businessOperationsRepository.createExpense(request.body);
    await auditRepository.create({ user: request.user, action: 'create', entityType: 'vehicle_expense', entityId: expense.id, request });
    response.status(201).json(expense);
  },
  updateExpense: async (request, response) => {
    requireRecord(await businessOperationsRepository.expense(request.params.id), 'Expense');
    const expense = await businessOperationsRepository.updateExpense(request.params.id, request.body);
    await auditRepository.create({ user: request.user, action: 'update', entityType: 'vehicle_expense', entityId: request.params.id, request });
    response.json(expense);
  },
  deleteExpense: async (request, response) => {
    const deleted = await businessOperationsRepository.deleteExpense(request.params.id);
    if (!deleted) throw notFound('Expense not found');
    await auditRepository.create({ user: request.user, action: 'delete', entityType: 'vehicle_expense', entityId: request.params.id, request });
    response.json({ success: true, id: Number(request.params.id) });
  },
  reportSummary: async (_request, response) => response.json(await businessOperationsRepository.reportSummary())
};
