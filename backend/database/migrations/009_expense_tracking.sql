SET search_path TO wwjcar, public;

ALTER TABLE vehicle_expenses
  DROP CONSTRAINT IF EXISTS vehicle_expenses_category_check,
  ADD CONSTRAINT vehicle_expenses_category_check CHECK (category IN ('fuel', 'maintenance', 'insurance', 'cleaning', 'other'));

CREATE INDEX IF NOT EXISTS vehicle_expenses_vehicle_category_index ON vehicle_expenses(vehicle_id, category);
CREATE INDEX IF NOT EXISTS vehicle_expenses_expense_date_index ON vehicle_expenses(expense_date);

DROP VIEW IF EXISTS expense_yearly_summary;
DROP VIEW IF EXISTS expense_monthly_summary;
DROP VIEW IF EXISTS expense_vehicle_summary;
DROP VIEW IF EXISTS expense_category_summary;

CREATE VIEW expense_monthly_summary AS
SELECT
  date_trunc('month', expense_date)::date AS expense_month,
  category,
  SUM(amount) AS expenses,
  COUNT(*) AS expenses_count
FROM vehicle_expenses
GROUP BY date_trunc('month', expense_date)::date, category;

CREATE VIEW expense_yearly_summary AS
SELECT
  date_trunc('year', expense_date)::date AS expense_year,
  category,
  SUM(amount) AS expenses,
  COUNT(*) AS expenses_count
FROM vehicle_expenses
GROUP BY date_trunc('year', expense_date)::date, category;

CREATE VIEW expense_vehicle_summary AS
SELECT
  cars.id AS vehicle_id,
  cars.name AS vehicle_name,
  COALESCE(SUM(vehicle_expenses.amount), 0) AS expenses,
  COUNT(vehicle_expenses.id) AS expenses_count
FROM cars
LEFT JOIN vehicle_expenses ON vehicle_expenses.vehicle_id = cars.id
GROUP BY cars.id, cars.name;

CREATE VIEW expense_category_summary AS
SELECT
  category,
  SUM(amount) AS expenses,
  COUNT(*) AS expenses_count
FROM vehicle_expenses
GROUP BY category;
