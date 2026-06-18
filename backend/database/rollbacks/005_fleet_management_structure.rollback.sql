SET search_path TO wwjcar, public;

DROP TRIGGER IF EXISTS vehicle_maintenance_set_updated_at ON vehicle_maintenance;
DROP TRIGGER IF EXISTS vehicle_maintenance_booking_overlap_check ON vehicle_maintenance;
DROP TRIGGER IF EXISTS vehicle_bookings_set_updated_at ON vehicle_bookings;
DROP TRIGGER IF EXISTS vehicle_bookings_maintenance_overlap_check ON vehicle_bookings;
DROP TRIGGER IF EXISTS booking_statuses_set_updated_at ON booking_statuses;

DROP FUNCTION IF EXISTS assert_vehicle_maintenance_not_booked();
DROP FUNCTION IF EXISTS assert_vehicle_booking_not_in_maintenance();

ALTER TABLE IF EXISTS vehicle_maintenance
  DROP CONSTRAINT IF EXISTS vehicle_maintenance_no_overlap;

ALTER TABLE IF EXISTS vehicle_bookings
  DROP CONSTRAINT IF EXISTS vehicle_bookings_no_overlap,
  DROP CONSTRAINT IF EXISTS vehicle_bookings_status_fk,
  DROP CONSTRAINT IF EXISTS vehicle_bookings_date_range_check;

DROP INDEX IF EXISTS vehicle_maintenance_active_range_index;
DROP INDEX IF EXISTS vehicle_maintenance_status_index;
DROP INDEX IF EXISTS vehicle_maintenance_dates_index;
DROP INDEX IF EXISTS vehicle_maintenance_vehicle_id_index;

DROP INDEX IF EXISTS vehicle_bookings_active_range_index;
DROP INDEX IF EXISTS vehicle_bookings_customer_phone_index;

DROP INDEX IF EXISTS booking_statuses_sort_order_index;

DROP TABLE IF EXISTS vehicle_maintenance;
DROP TABLE IF EXISTS booking_statuses;

UPDATE vehicle_bookings
SET status = 'booked'
WHERE status = 'reserved';

ALTER TABLE IF EXISTS vehicle_bookings
  ALTER COLUMN status SET DEFAULT 'booked',
  ADD CONSTRAINT vehicle_bookings_status_check CHECK (status IN ('booked', 'returned', 'cancelled', 'maintenance')),
  ADD CONSTRAINT vehicle_bookings_date_range_check CHECK (end_date >= start_date);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'wwjcar'
      AND table_name = 'vehicle_bookings'
      AND column_name = 'customer_phone'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'wwjcar'
      AND table_name = 'vehicle_bookings'
      AND column_name = 'phone'
  ) THEN
    ALTER TABLE vehicle_bookings RENAME COLUMN customer_phone TO phone;
  END IF;
END $$;

DROP TRIGGER IF EXISTS vehicle_bookings_set_updated_at ON vehicle_bookings;
CREATE TRIGGER vehicle_bookings_set_updated_at
BEFORE UPDATE ON vehicle_bookings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
