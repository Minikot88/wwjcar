SET search_path TO wwjcar, public;

ALTER TABLE vehicle_bookings
  ADD COLUMN IF NOT EXISTS revenue_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;

UPDATE vehicle_bookings
SET revenue_amount = GREATEST((end_date - start_date) + 1, 1) * cars.price_per_day
FROM cars
WHERE vehicle_bookings.vehicle_id = cars.id
  AND vehicle_bookings.revenue_amount = 0
  AND vehicle_bookings.status IN ('reserved', 'active', 'returned');

ALTER TABLE vehicle_bookings
  DROP CONSTRAINT IF EXISTS vehicle_bookings_revenue_amount_check,
  ADD CONSTRAINT vehicle_bookings_revenue_amount_check CHECK (revenue_amount >= 0);

CREATE INDEX IF NOT EXISTS vehicle_bookings_revenue_date_index ON vehicle_bookings(start_date, status);
CREATE INDEX IF NOT EXISTS vehicle_bookings_revenue_vehicle_index ON vehicle_bookings(vehicle_id, revenue_amount);

DROP VIEW IF EXISTS booking_yearly_revenue;
DROP VIEW IF EXISTS booking_monthly_revenue;
DROP VIEW IF EXISTS booking_daily_revenue;
DROP VIEW IF EXISTS booking_vehicle_revenue;

CREATE VIEW booking_daily_revenue AS
SELECT
  start_date AS revenue_date,
  SUM(revenue_amount) AS revenue,
  COUNT(*) AS bookings_count
FROM vehicle_bookings
WHERE status IN ('reserved', 'active', 'returned')
GROUP BY start_date;

CREATE VIEW booking_monthly_revenue AS
SELECT
  date_trunc('month', start_date)::date AS revenue_month,
  SUM(revenue_amount) AS revenue,
  COUNT(*) AS bookings_count
FROM vehicle_bookings
WHERE status IN ('reserved', 'active', 'returned')
GROUP BY date_trunc('month', start_date)::date;

CREATE VIEW booking_yearly_revenue AS
SELECT
  date_trunc('year', start_date)::date AS revenue_year,
  SUM(revenue_amount) AS revenue,
  COUNT(*) AS bookings_count
FROM vehicle_bookings
WHERE status IN ('reserved', 'active', 'returned')
GROUP BY date_trunc('year', start_date)::date;

CREATE VIEW booking_vehicle_revenue AS
SELECT
  cars.id AS vehicle_id,
  cars.name AS vehicle_name,
  COALESCE(SUM(vehicle_bookings.revenue_amount), 0) AS revenue,
  COUNT(vehicle_bookings.id) FILTER (WHERE vehicle_bookings.status IN ('reserved', 'active', 'returned')) AS bookings_count
FROM cars
LEFT JOIN vehicle_bookings
  ON vehicle_bookings.vehicle_id = cars.id
  AND vehicle_bookings.status IN ('reserved', 'active', 'returned')
GROUP BY cars.id, cars.name;
