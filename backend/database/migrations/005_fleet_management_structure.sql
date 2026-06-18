SET search_path TO wwjcar, public;

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS booking_statuses (
  code VARCHAR(40) PRIMARY KEY,
  label VARCHAR(120) NOT NULL,
  blocks_availability BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO booking_statuses (code, label, blocks_availability, sort_order)
VALUES
  ('reserved', 'Reserved', TRUE, 10),
  ('active', 'Active', TRUE, 20),
  ('returned', 'Returned', FALSE, 30),
  ('cancelled', 'Cancelled', FALSE, 40),
  ('maintenance', 'Maintenance', TRUE, 50)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  blocks_availability = EXCLUDED.blocks_availability,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS vehicle_bookings (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  customer_name VARCHAR(190) NOT NULL,
  customer_phone VARCHAR(80) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'reserved',
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'wwjcar'
      AND table_name = 'vehicle_bookings'
      AND column_name = 'phone'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'wwjcar'
      AND table_name = 'vehicle_bookings'
      AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE vehicle_bookings RENAME COLUMN phone TO customer_phone;
  END IF;
END $$;

ALTER TABLE vehicle_bookings
  ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(80),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE vehicle_bookings
SET customer_phone = COALESCE(customer_phone, '')
WHERE customer_phone IS NULL;

UPDATE vehicle_bookings
SET status = 'reserved'
WHERE status = 'booked';

ALTER TABLE vehicle_bookings
  ALTER COLUMN customer_phone SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'reserved';

DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  FOR constraint_record IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'wwjcar.vehicle_bookings'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE vehicle_bookings DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
  END LOOP;
END $$;

ALTER TABLE vehicle_bookings
  DROP CONSTRAINT IF EXISTS vehicle_bookings_date_range_check,
  DROP CONSTRAINT IF EXISTS vehicle_bookings_status_fk,
  ADD CONSTRAINT vehicle_bookings_date_range_check CHECK (end_date >= start_date),
  ADD CONSTRAINT vehicle_bookings_status_fk FOREIGN KEY (status) REFERENCES booking_statuses(code);

CREATE TABLE IF NOT EXISTS vehicle_maintenance (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'maintenance' REFERENCES booking_statuses(code),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT vehicle_maintenance_date_range_check CHECK (end_date >= start_date),
  CONSTRAINT vehicle_maintenance_status_check CHECK (status IN ('maintenance', 'returned', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS booking_statuses_sort_order_index ON booking_statuses(sort_order);

CREATE INDEX IF NOT EXISTS vehicle_bookings_vehicle_id_index ON vehicle_bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS vehicle_bookings_dates_index ON vehicle_bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS vehicle_bookings_status_index ON vehicle_bookings(status);
CREATE INDEX IF NOT EXISTS vehicle_bookings_customer_phone_index ON vehicle_bookings(customer_phone);
DROP INDEX IF EXISTS vehicle_bookings_active_range_index;
CREATE INDEX vehicle_bookings_active_range_index ON vehicle_bookings(vehicle_id, start_date, end_date)
WHERE status IN ('reserved', 'active', 'maintenance');

CREATE INDEX IF NOT EXISTS vehicle_maintenance_vehicle_id_index ON vehicle_maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS vehicle_maintenance_dates_index ON vehicle_maintenance(start_date, end_date);
CREATE INDEX IF NOT EXISTS vehicle_maintenance_status_index ON vehicle_maintenance(status);
DROP INDEX IF EXISTS vehicle_maintenance_active_range_index;
CREATE INDEX vehicle_maintenance_active_range_index ON vehicle_maintenance(vehicle_id, start_date, end_date)
WHERE status = 'maintenance';

ALTER TABLE vehicle_bookings
  DROP CONSTRAINT IF EXISTS vehicle_bookings_no_overlap;

ALTER TABLE vehicle_bookings
  ADD CONSTRAINT vehicle_bookings_no_overlap
  EXCLUDE USING gist (
    vehicle_id WITH =,
    daterange(start_date, end_date + 1, '[)') WITH &&
  )
  WHERE (status IN ('reserved', 'active', 'maintenance'));

ALTER TABLE vehicle_maintenance
  DROP CONSTRAINT IF EXISTS vehicle_maintenance_no_overlap;

ALTER TABLE vehicle_maintenance
  ADD CONSTRAINT vehicle_maintenance_no_overlap
  EXCLUDE USING gist (
    vehicle_id WITH =,
    daterange(start_date, end_date + 1, '[)') WITH &&
  )
  WHERE (status = 'maintenance');

CREATE OR REPLACE FUNCTION assert_vehicle_booking_not_in_maintenance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('reserved', 'active', 'maintenance') AND EXISTS (
    SELECT 1
    FROM vehicle_maintenance
    WHERE vehicle_maintenance.vehicle_id = NEW.vehicle_id
      AND vehicle_maintenance.status = 'maintenance'
      AND daterange(vehicle_maintenance.start_date, vehicle_maintenance.end_date + 1, '[)')
        && daterange(NEW.start_date, NEW.end_date + 1, '[)')
    LIMIT 1
  ) THEN
    RAISE EXCEPTION 'Vehicle % is under maintenance between % and %', NEW.vehicle_id, NEW.start_date, NEW.end_date
      USING ERRCODE = '23P01';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION assert_vehicle_maintenance_not_booked()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'maintenance' AND EXISTS (
    SELECT 1
    FROM vehicle_bookings
    WHERE vehicle_bookings.vehicle_id = NEW.vehicle_id
      AND vehicle_bookings.status IN ('reserved', 'active', 'maintenance')
      AND daterange(vehicle_bookings.start_date, vehicle_bookings.end_date + 1, '[)')
        && daterange(NEW.start_date, NEW.end_date + 1, '[)')
    LIMIT 1
  ) THEN
    RAISE EXCEPTION 'Vehicle % is booked between % and %', NEW.vehicle_id, NEW.start_date, NEW.end_date
      USING ERRCODE = '23P01';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vehicle_bookings_maintenance_overlap_check ON vehicle_bookings;
CREATE TRIGGER vehicle_bookings_maintenance_overlap_check
BEFORE INSERT OR UPDATE OF vehicle_id, start_date, end_date, status ON vehicle_bookings
FOR EACH ROW EXECUTE FUNCTION assert_vehicle_booking_not_in_maintenance();

DROP TRIGGER IF EXISTS vehicle_maintenance_booking_overlap_check ON vehicle_maintenance;
CREATE TRIGGER vehicle_maintenance_booking_overlap_check
BEFORE INSERT OR UPDATE OF vehicle_id, start_date, end_date, status ON vehicle_maintenance
FOR EACH ROW EXECUTE FUNCTION assert_vehicle_maintenance_not_booked();

DROP TRIGGER IF EXISTS booking_statuses_set_updated_at ON booking_statuses;
CREATE TRIGGER booking_statuses_set_updated_at
BEFORE UPDATE ON booking_statuses
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS vehicle_bookings_set_updated_at ON vehicle_bookings;
CREATE TRIGGER vehicle_bookings_set_updated_at
BEFORE UPDATE ON vehicle_bookings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS vehicle_maintenance_set_updated_at ON vehicle_maintenance;
CREATE TRIGGER vehicle_maintenance_set_updated_at
BEFORE UPDATE ON vehicle_maintenance
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
