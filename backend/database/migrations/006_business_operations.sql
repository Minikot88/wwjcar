SET search_path TO wwjcar, public;

CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  phone VARCHAR(80) NOT NULL,
  email VARCHAR(190),
  nationality VARCHAR(120),
  id_card_number VARCHAR(120),
  driving_license_number VARCHAR(120),
  notes TEXT,
  rental_count INTEGER NOT NULL DEFAULT 0,
  last_rental_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_notes (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contracts (
  id BIGSERIAL PRIMARY KEY,
  contract_number VARCHAR(80) NOT NULL UNIQUE,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  vehicle_id BIGINT NOT NULL REFERENCES cars(id) ON DELETE RESTRICT,
  booking_id BIGINT REFERENCES vehicle_bookings(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  note TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT contracts_date_range_check CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS contract_attachments (
  id BIGSERIAL PRIMARY KEY,
  contract_id BIGINT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  upload_id BIGINT REFERENCES uploads(id) ON DELETE SET NULL,
  attachment_type VARCHAR(40) NOT NULL CHECK (attachment_type IN ('id_card', 'driving_license', 'contract_pdf', 'other')),
  file_url TEXT NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicle_expenses (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category VARCHAR(40) NOT NULL CHECK (category IN ('fuel', 'maintenance', 'insurance', 'cleaning', 'other')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  vendor VARCHAR(190),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS customers_phone_index ON customers(phone);
CREATE INDEX IF NOT EXISTS customers_name_index ON customers(name);
CREATE INDEX IF NOT EXISTS customer_notes_customer_id_index ON customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS contracts_customer_id_index ON contracts(customer_id);
CREATE INDEX IF NOT EXISTS contracts_vehicle_id_index ON contracts(vehicle_id);
CREATE INDEX IF NOT EXISTS contracts_status_index ON contracts(status);
CREATE INDEX IF NOT EXISTS contracts_dates_index ON contracts(start_date, end_date);
CREATE INDEX IF NOT EXISTS contract_attachments_contract_id_index ON contract_attachments(contract_id);
CREATE INDEX IF NOT EXISTS contract_attachments_type_index ON contract_attachments(attachment_type);
CREATE INDEX IF NOT EXISTS vehicle_expenses_vehicle_id_index ON vehicle_expenses(vehicle_id);
CREATE INDEX IF NOT EXISTS vehicle_expenses_date_index ON vehicle_expenses(expense_date);
CREATE INDEX IF NOT EXISTS vehicle_expenses_category_index ON vehicle_expenses(category);

DROP VIEW IF EXISTS vehicle_profitability;
DROP VIEW IF EXISTS yearly_revenue;
DROP VIEW IF EXISTS monthly_revenue;
DROP VIEW IF EXISTS daily_revenue;

CREATE VIEW daily_revenue AS
SELECT
  start_date AS revenue_date,
  SUM(total_amount) AS revenue,
  COUNT(*) AS contracts_count
FROM contracts
WHERE status IN ('active', 'completed')
GROUP BY start_date;

CREATE VIEW monthly_revenue AS
SELECT
  date_trunc('month', start_date)::date AS revenue_month,
  SUM(total_amount) AS revenue,
  COUNT(*) AS contracts_count
FROM contracts
WHERE status IN ('active', 'completed')
GROUP BY date_trunc('month', start_date)::date;

CREATE VIEW yearly_revenue AS
SELECT
  date_trunc('year', start_date)::date AS revenue_year,
  SUM(total_amount) AS revenue,
  COUNT(*) AS contracts_count
FROM contracts
WHERE status IN ('active', 'completed')
GROUP BY date_trunc('year', start_date)::date;

CREATE VIEW vehicle_profitability AS
SELECT
  cars.id AS vehicle_id,
  cars.name AS vehicle_name,
  COALESCE(contract_totals.revenue, 0) AS revenue,
  COALESCE(expense_totals.expenses, 0) AS expenses,
  COALESCE(contract_totals.revenue, 0) - COALESCE(expense_totals.expenses, 0) AS profit,
  COALESCE(contract_totals.contracts_count, 0) AS contracts_count
FROM cars
LEFT JOIN (
  SELECT vehicle_id, SUM(total_amount) AS revenue, COUNT(*) AS contracts_count
  FROM contracts
  WHERE status IN ('active', 'completed')
  GROUP BY vehicle_id
) AS contract_totals ON contract_totals.vehicle_id = cars.id
LEFT JOIN (
  SELECT vehicle_id, SUM(amount) AS expenses
  FROM vehicle_expenses
  GROUP BY vehicle_id
) AS expense_totals ON expense_totals.vehicle_id = cars.id;

DROP TRIGGER IF EXISTS customers_set_updated_at ON customers;
CREATE TRIGGER customers_set_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS contracts_set_updated_at ON contracts;
CREATE TRIGGER contracts_set_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS vehicle_expenses_set_updated_at ON vehicle_expenses;
CREATE TRIGGER vehicle_expenses_set_updated_at BEFORE UPDATE ON vehicle_expenses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
