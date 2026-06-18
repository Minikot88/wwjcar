SET search_path TO wwjcar, public;

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS note TEXT;

UPDATE customers
SET note = COALESCE(note, notes)
WHERE note IS NULL AND notes IS NOT NULL;

ALTER TABLE vehicle_bookings
  ADD COLUMN IF NOT EXISTS customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS customers_last_rental_date_index ON customers(last_rental_date);
CREATE INDEX IF NOT EXISTS customers_rental_count_index ON customers(rental_count);
CREATE INDEX IF NOT EXISTS vehicle_bookings_customer_id_index ON vehicle_bookings(customer_id);

INSERT INTO customers (name, phone, note)
SELECT DISTINCT ON (customer_phone)
  customer_name,
  customer_phone,
  'Imported from booking history'
FROM vehicle_bookings
WHERE customer_id IS NULL
  AND customer_phone IS NOT NULL
  AND customer_phone <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM customers
    WHERE customers.phone = vehicle_bookings.customer_phone
  )
ORDER BY customer_phone, created_at DESC;

UPDATE vehicle_bookings
SET customer_id = matched.customer_id
FROM (
  SELECT DISTINCT ON (vehicle_bookings.id)
    vehicle_bookings.id AS booking_id,
    customers.id AS customer_id
  FROM vehicle_bookings
  JOIN customers ON customers.phone = vehicle_bookings.customer_phone
  WHERE vehicle_bookings.customer_id IS NULL
  ORDER BY vehicle_bookings.id, customers.id
) AS matched
WHERE vehicle_bookings.id = matched.booking_id;

CREATE OR REPLACE FUNCTION refresh_customer_rental_stats(target_customer_id BIGINT)
RETURNS VOID AS $$
BEGIN
  IF target_customer_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE customers
  SET
    rental_count = COALESCE((
      SELECT COUNT(*)
      FROM vehicle_bookings
      WHERE customer_id = target_customer_id
        AND status IN ('reserved', 'active', 'returned')
    ), 0) + COALESCE((
      SELECT COUNT(*)
      FROM contracts
      WHERE customer_id = target_customer_id
        AND status IN ('active', 'completed')
    ), 0),
    last_rental_date = GREATEST(
      COALESCE((
        SELECT MAX(end_date)
        FROM vehicle_bookings
        WHERE customer_id = target_customer_id
          AND status IN ('reserved', 'active', 'returned')
      ), DATE '1900-01-01'),
      COALESCE((
        SELECT MAX(end_date)
        FROM contracts
        WHERE customer_id = target_customer_id
          AND status IN ('active', 'completed')
      ), DATE '1900-01-01')
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = target_customer_id;

  UPDATE customers
  SET last_rental_date = NULL
  WHERE id = target_customer_id
    AND last_rental_date = DATE '1900-01-01';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_customer_booking_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM refresh_customer_rental_stats(OLD.customer_id);
    RETURN OLD;
  END IF;

  PERFORM refresh_customer_rental_stats(NEW.customer_id);

  IF TG_OP = 'UPDATE' AND OLD.customer_id IS DISTINCT FROM NEW.customer_id THEN
    PERFORM refresh_customer_rental_stats(OLD.customer_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vehicle_bookings_customer_stats ON vehicle_bookings;
CREATE TRIGGER vehicle_bookings_customer_stats
AFTER INSERT OR UPDATE OR DELETE ON vehicle_bookings
FOR EACH ROW EXECUTE FUNCTION sync_customer_booking_stats();

DO $$
DECLARE
  customer_record RECORD;
BEGIN
  FOR customer_record IN SELECT id FROM customers LOOP
    PERFORM refresh_customer_rental_stats(customer_record.id);
  END LOOP;
END $$;
