import { pool } from '../db/pool.js';

function normalizeDate(value) {
  if (value instanceof Date) {
    const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60 * 1000);
    return localDate.toISOString().slice(0, 10);
  }
  return String(value || '').slice(0, 10);
}

function pagination(filters = {}) {
  const page = Math.max(Number(filters.page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(filters.pageSize || filters.limit) || 50, 1), 100);
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function listResult(rows, countRows, page, pageSize, mapper) {
  return {
    items: rows.map(mapper),
    total: Number(countRows[0]?.total || 0),
    page,
    pageSize
  };
}

function mapCustomer(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || '',
    address: row.address || '',
    nationality: row.nationality || '',
    idCardNumber: row.id_card_number || '',
    drivingLicenseNumber: row.driving_license_number || '',
    note: row.note || row.notes || '',
    notes: row.note || row.notes || '',
    rentalCount: Number(row.rental_count || 0),
    lastRentalDate: normalizeDate(row.last_rental_date),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapContract(row) {
  return {
    id: row.id,
    contractNumber: row.contract_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    vehicleId: row.vehicle_id,
    vehicleName: row.vehicle_name,
    bookingId: row.booking_id,
    startDate: normalizeDate(row.start_date),
    endDate: normalizeDate(row.end_date),
    totalAmount: Number(row.total_amount || 0),
    status: row.status,
    note: row.note || '',
    pdfUrl: row.pdf_url || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapAttachment(row) {
  return {
    id: row.id,
    contractId: row.contract_id,
    uploadId: row.upload_id,
    attachmentType: row.attachment_type,
    fileUrl: row.file_url,
    originalName: row.original_name || '',
    mimeType: row.mime_type || '',
    createdAt: row.created_at
  };
}

function mapExpense(row) {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    vehicleName: row.vehicle_name,
    expenseDate: normalizeDate(row.expense_date),
    category: row.category,
    amount: Number(row.amount || 0),
    vendor: row.vendor || '',
    note: row.note || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const businessOperationsRepository = {
  async customerSummary() {
    const [[repeatRows], [frequentRows], [recentRows]] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM customers WHERE rental_count >= 2'),
      pool.query('SELECT * FROM customers WHERE rental_count > 0 ORDER BY rental_count DESC, last_rental_date DESC NULLS LAST LIMIT 5'),
      pool.query('SELECT * FROM customers ORDER BY created_at DESC, id DESC LIMIT 5')
    ]);

    return {
      repeatCustomers: Number(repeatRows[0]?.total || 0),
      frequentCustomers: frequentRows.map(mapCustomer),
      recentCustomers: recentRows.map(mapCustomer)
    };
  },

  async customers(filters = {}) {
    const where = [];
    const values = [];
    const { page, pageSize, offset } = pagination(filters);
    if (filters.search) {
      where.push('(name ILIKE ? OR phone ILIKE ? OR email ILIKE ? OR notes ILIKE ?)');
      const search = `%${filters.search}%`;
      values.push(search, search, search, search);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(`SELECT * FROM customers ${whereSql} ORDER BY updated_at DESC, id DESC LIMIT ? OFFSET ?`, [...values, pageSize, offset]);
    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM customers ${whereSql}`, values);
    return listResult(rows, countRows, page, pageSize, mapCustomer);
  },

  async customer(id) {
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ? LIMIT 1', [id]);
    return mapCustomer(rows[0]);
  },

  async createCustomer(payload) {
    const [insertRows] = await pool.query(
      `INSERT INTO customers (name, phone, email, address, nationality, id_card_number, driving_license_number, note, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [
        payload.name,
        payload.phone,
        payload.email || null,
        payload.address || null,
        payload.nationality || null,
        payload.idCardNumber || null,
        payload.drivingLicenseNumber || null,
        payload.note || payload.notes || null,
        payload.note || payload.notes || null
      ]
    );
    return this.customer(insertRows[0].id);
  },

  async updateCustomer(id, payload) {
    await pool.query(
      `UPDATE customers SET name = ?, phone = ?, email = ?, address = ?, nationality = ?, id_card_number = ?, driving_license_number = ?, note = ?, notes = ?
       WHERE id = ?`,
      [
        payload.name,
        payload.phone,
        payload.email || null,
        payload.address || null,
        payload.nationality || null,
        payload.idCardNumber || null,
        payload.drivingLicenseNumber || null,
        payload.note || payload.notes || null,
        payload.note || payload.notes || null,
        id
      ]
    );
    return this.customer(id);
  },

  async deleteCustomer(id) {
    const [, metadata] = await pool.query('DELETE FROM customers WHERE id = ?', [id]);
    return metadata.rowCount > 0;
  },

  async addCustomerNote(customerId, note, userId = null) {
    const [rows] = await pool.query('INSERT INTO customer_notes (customer_id, note, created_by) VALUES (?, ?, ?) RETURNING id', [customerId, note, userId]);
    return rows[0];
  },

  async customerNotes(customerId) {
    const [rows] = await pool.query('SELECT * FROM customer_notes WHERE customer_id = ? ORDER BY created_at DESC, id DESC', [customerId]);
    return rows.map((row) => ({ id: row.id, customerId: row.customer_id, note: row.note, createdBy: row.created_by, createdAt: row.created_at }));
  },

  async customerHistory(customerId) {
    const [rows] = await pool.query(
      `SELECT
        vehicle_bookings.id,
        vehicle_bookings.vehicle_id,
        cars.name AS vehicle_name,
        cars.slug AS vehicle_slug,
        vehicle_bookings.start_date,
        vehicle_bookings.end_date,
        vehicle_bookings.status,
        vehicle_bookings.note,
        vehicle_bookings.created_at
       FROM vehicle_bookings
       JOIN cars ON cars.id = vehicle_bookings.vehicle_id
       WHERE vehicle_bookings.customer_id = ?
       ORDER BY vehicle_bookings.start_date DESC, vehicle_bookings.id DESC`,
      [customerId]
    );

    return rows.map((row) => ({
      id: row.id,
      vehicleId: row.vehicle_id,
      vehicleName: row.vehicle_name,
      vehicleSlug: row.vehicle_slug,
      startDate: normalizeDate(row.start_date),
      endDate: normalizeDate(row.end_date),
      status: row.status,
      note: row.note || '',
      createdAt: row.created_at
    }));
  },

  async contracts(filters = {}) {
    const where = [];
    const values = [];
    const { page, pageSize, offset } = pagination(filters);
    if (filters.customerId) {
      where.push('contracts.customer_id = ?');
      values.push(filters.customerId);
    }
    if (filters.vehicleId) {
      where.push('contracts.vehicle_id = ?');
      values.push(filters.vehicleId);
    }
    if (filters.status) {
      where.push('contracts.status = ?');
      values.push(filters.status);
    }
    if (filters.search) {
      where.push('(contracts.contract_number ILIKE ? OR customers.name ILIKE ? OR cars.name ILIKE ?)');
      const search = `%${filters.search}%`;
      values.push(search, search, search);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT contracts.*, customers.name AS customer_name, cars.name AS vehicle_name
       FROM contracts
       JOIN customers ON customers.id = contracts.customer_id
       JOIN cars ON cars.id = contracts.vehicle_id
       ${whereSql}
       ORDER BY contracts.start_date DESC, contracts.id DESC
       LIMIT ? OFFSET ?`,
      [...values, pageSize, offset]
    );
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM contracts
       JOIN customers ON customers.id = contracts.customer_id
       JOIN cars ON cars.id = contracts.vehicle_id
       ${whereSql}`,
      values
    );
    return listResult(rows, countRows, page, pageSize, mapContract);
  },

  async contract(id) {
    const [rows] = await pool.query(
      `SELECT contracts.*, customers.name AS customer_name, cars.name AS vehicle_name
       FROM contracts
       JOIN customers ON customers.id = contracts.customer_id
       JOIN cars ON cars.id = contracts.vehicle_id
       WHERE contracts.id = ?
       LIMIT 1`,
      [id]
    );
    const contract = mapContract(rows[0]);
    if (contract) contract.attachments = await this.contractAttachments(id);
    return contract;
  },

  async createContract(payload) {
    const [insertRows] = await pool.query(
      `INSERT INTO contracts (contract_number, customer_id, vehicle_id, booking_id, start_date, end_date, total_amount, status, note, pdf_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [payload.contractNumber, payload.customerId, payload.vehicleId, payload.bookingId || null, payload.startDate, payload.endDate, Number(payload.totalAmount) || 0, payload.status || 'draft', payload.note || null, payload.pdfUrl || null]
    );
    await this.refreshCustomerRentalStats(payload.customerId);
    return this.contract(insertRows[0].id);
  },

  async updateContract(id, payload) {
    const existing = await this.contract(id);
    await pool.query(
      `UPDATE contracts SET contract_number = ?, customer_id = ?, vehicle_id = ?, booking_id = ?, start_date = ?, end_date = ?, total_amount = ?, status = ?, note = ?, pdf_url = ?
       WHERE id = ?`,
      [payload.contractNumber, payload.customerId, payload.vehicleId, payload.bookingId || null, payload.startDate, payload.endDate, Number(payload.totalAmount) || 0, payload.status || 'draft', payload.note || null, payload.pdfUrl || null, id]
    );
    if (existing?.customerId) await this.refreshCustomerRentalStats(existing.customerId);
    await this.refreshCustomerRentalStats(payload.customerId);
    return this.contract(id);
  },

  async deleteContract(id) {
    const existing = await this.contract(id);
    const [, metadata] = await pool.query('DELETE FROM contracts WHERE id = ?', [id]);
    if (existing?.customerId) await this.refreshCustomerRentalStats(existing.customerId);
    return metadata.rowCount > 0;
  },

  async createAttachment(contractId, payload) {
    const [rows] = await pool.query(
      `INSERT INTO contract_attachments (contract_id, upload_id, attachment_type, file_url, original_name, mime_type)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
      [contractId, payload.uploadId || null, payload.attachmentType, payload.fileUrl, payload.originalName || null, payload.mimeType || null]
    );
    const [resultRows] = await pool.query('SELECT * FROM contract_attachments WHERE id = ?', [rows[0].id]);
    return mapAttachment(resultRows[0]);
  },

  async contractAttachments(contractId) {
    const [rows] = await pool.query('SELECT * FROM contract_attachments WHERE contract_id = ? ORDER BY created_at DESC, id DESC', [contractId]);
    return rows.map(mapAttachment);
  },

  async expenses(filters = {}) {
    const where = [];
    const values = [];
    const { page, pageSize, offset } = pagination(filters);
    if (filters.vehicleId) {
      where.push('vehicle_expenses.vehicle_id = ?');
      values.push(filters.vehicleId);
    }
    if (filters.category) {
      where.push('vehicle_expenses.category = ?');
      values.push(filters.category);
    }
    if (filters.from && filters.to) {
      where.push('vehicle_expenses.expense_date BETWEEN ? AND ?');
      values.push(filters.from, filters.to);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT vehicle_expenses.*, cars.name AS vehicle_name
       FROM vehicle_expenses
       JOIN cars ON cars.id = vehicle_expenses.vehicle_id
       ${whereSql}
       ORDER BY vehicle_expenses.expense_date DESC, vehicle_expenses.id DESC
       LIMIT ? OFFSET ?`,
      [...values, pageSize, offset]
    );
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM vehicle_expenses
       JOIN cars ON cars.id = vehicle_expenses.vehicle_id
       ${whereSql}`,
      values
    );
    return listResult(rows, countRows, page, pageSize, mapExpense);
  },

  async expenseSummary() {
    const [[totalRows], [vehicleRows], [categoryRows], [monthlyRows], [yearlyRows]] = await Promise.all([
      pool.query(
        `SELECT
          COALESCE(SUM(amount) FILTER (WHERE expense_date = CURRENT_DATE), 0) AS today_expenses,
          COALESCE(SUM(amount) FILTER (
            WHERE expense_date >= date_trunc('month', CURRENT_DATE)::date
              AND expense_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
          ), 0) AS monthly_expenses,
          COALESCE(SUM(amount) FILTER (
            WHERE expense_date >= date_trunc('year', CURRENT_DATE)::date
              AND expense_date < (date_trunc('year', CURRENT_DATE) + INTERVAL '1 year')::date
          ), 0) AS yearly_expenses
         FROM vehicle_expenses`
      ),
      pool.query('SELECT * FROM expense_vehicle_summary ORDER BY expenses DESC, expenses_count DESC LIMIT 10'),
      pool.query('SELECT * FROM expense_category_summary ORDER BY expenses DESC'),
      pool.query('SELECT * FROM expense_monthly_summary ORDER BY expense_month DESC, expenses DESC LIMIT 12'),
      pool.query('SELECT * FROM expense_yearly_summary ORDER BY expense_year DESC, expenses DESC LIMIT 10')
    ]);

    return {
      todayExpenses: Number(totalRows[0]?.today_expenses || 0),
      monthlyExpenses: Number(totalRows[0]?.monthly_expenses || 0),
      yearlyExpenses: Number(totalRows[0]?.yearly_expenses || 0),
      expensesPerVehicle: vehicleRows.map((row) => ({
        vehicleId: row.vehicle_id,
        vehicleName: row.vehicle_name,
        expenses: Number(row.expenses || 0),
        expensesCount: Number(row.expenses_count || 0)
      })),
      expensesByCategory: categoryRows.map((row) => ({
        category: row.category,
        expenses: Number(row.expenses || 0),
        expensesCount: Number(row.expenses_count || 0)
      })),
      monthlyExpensesBreakdown: monthlyRows.map((row) => ({
        month: normalizeDate(row.expense_month),
        category: row.category,
        expenses: Number(row.expenses || 0),
        expensesCount: Number(row.expenses_count || 0)
      })),
      yearlyExpensesBreakdown: yearlyRows.map((row) => ({
        year: normalizeDate(row.expense_year),
        category: row.category,
        expenses: Number(row.expenses || 0),
        expensesCount: Number(row.expenses_count || 0)
      }))
    };
  },

  async expense(id) {
    const [rows] = await pool.query(
      `SELECT vehicle_expenses.*, cars.name AS vehicle_name
       FROM vehicle_expenses JOIN cars ON cars.id = vehicle_expenses.vehicle_id
       WHERE vehicle_expenses.id = ? LIMIT 1`,
      [id]
    );
    return mapExpense(rows[0]);
  },

  async createExpense(payload) {
    const [rows] = await pool.query(
      `INSERT INTO vehicle_expenses (vehicle_id, expense_date, category, amount, vendor, note)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
      [payload.vehicleId, payload.expenseDate, payload.category, Number(payload.amount) || 0, payload.vendor || null, payload.note || null]
    );
    return this.expense(rows[0].id);
  },

  async updateExpense(id, payload) {
    await pool.query(
      `UPDATE vehicle_expenses SET vehicle_id = ?, expense_date = ?, category = ?, amount = ?, vendor = ?, note = ?
       WHERE id = ?`,
      [payload.vehicleId, payload.expenseDate, payload.category, Number(payload.amount) || 0, payload.vendor || null, payload.note || null, id]
    );
    return this.expense(id);
  },

  async deleteExpense(id) {
    const [, metadata] = await pool.query('DELETE FROM vehicle_expenses WHERE id = ?', [id]);
    return metadata.rowCount > 0;
  },

  async refreshCustomerRentalStats(customerId) {
    await pool.query(
      `UPDATE customers SET
        rental_count =
          COALESCE((SELECT COUNT(*) FROM vehicle_bookings WHERE customer_id = ? AND status IN ('reserved', 'active', 'returned')), 0)
          + COALESCE((SELECT COUNT(*) FROM contracts WHERE customer_id = ? AND status IN ('active', 'completed')), 0),
        last_rental_date = NULLIF(GREATEST(
          COALESCE((SELECT MAX(end_date) FROM vehicle_bookings WHERE customer_id = ? AND status IN ('reserved', 'active', 'returned')), DATE '1900-01-01'),
          COALESCE((SELECT MAX(end_date) FROM contracts WHERE customer_id = ? AND status IN ('active', 'completed')), DATE '1900-01-01')
        ), DATE '1900-01-01')
       WHERE id = ?`,
      [customerId, customerId, customerId, customerId, customerId]
    );
  },

  async reportSummary() {
    const [[revenueRows], [expenseRows], [topVehicles], [topCustomers]] = await Promise.all([
      pool.query("SELECT COALESCE(SUM(total_amount), 0) AS total FROM contracts WHERE status IN ('active', 'completed')"),
      pool.query('SELECT COALESCE(SUM(amount), 0) AS total FROM vehicle_expenses'),
      pool.query('SELECT * FROM vehicle_profitability ORDER BY profit DESC, revenue DESC LIMIT 5'),
      pool.query(
        `SELECT customers.id, customers.name, customers.phone, customers.rental_count, customers.last_rental_date, COALESCE(SUM(contracts.total_amount), 0) AS revenue
         FROM customers
         LEFT JOIN contracts ON contracts.customer_id = customers.id AND contracts.status IN ('active', 'completed')
         GROUP BY customers.id
         ORDER BY revenue DESC, customers.rental_count DESC
         LIMIT 5`
      )
    ]);
    const revenue = Number(revenueRows[0]?.total || 0);
    const expenses = Number(expenseRows[0]?.total || 0);
    return {
      revenue,
      expenses,
      profit: revenue - expenses,
      topVehicles: topVehicles.map((row) => ({
        vehicleId: row.vehicle_id,
        vehicleName: row.vehicle_name,
        revenue: Number(row.revenue || 0),
        expenses: Number(row.expenses || 0),
        profit: Number(row.profit || 0),
        contractsCount: Number(row.contracts_count || 0)
      })),
      topCustomers: topCustomers.map((row) => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        rentalCount: Number(row.rental_count || 0),
        lastRentalDate: normalizeDate(row.last_rental_date),
        revenue: Number(row.revenue || 0)
      }))
    };
  }
};
