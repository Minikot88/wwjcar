SET search_path TO wwjcar, public;

CREATE TABLE IF NOT EXISTS vehicle_bookings (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  customer_name VARCHAR(190) NOT NULL,
  phone VARCHAR(80) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'returned', 'cancelled', 'maintenance')),
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS vehicle_bookings_vehicle_id_index ON vehicle_bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS vehicle_bookings_dates_index ON vehicle_bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS vehicle_bookings_status_index ON vehicle_bookings(status);
CREATE INDEX IF NOT EXISTS vehicle_bookings_active_range_index ON vehicle_bookings(vehicle_id, start_date, end_date)
WHERE status IN ('booked', 'maintenance');

DROP TRIGGER IF EXISTS vehicle_bookings_set_updated_at ON vehicle_bookings;
CREATE TRIGGER vehicle_bookings_set_updated_at BEFORE UPDATE ON vehicle_bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
