SET search_path TO wwjcar, public;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'wwjcar'
  AND table_name IN ('vehicle_bookings', 'booking_statuses', 'vehicle_maintenance')
ORDER BY table_name;

SELECT code, label, blocks_availability, sort_order
FROM booking_statuses
ORDER BY sort_order;

SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'wwjcar'
  AND tc.table_name IN ('vehicle_bookings', 'booking_statuses', 'vehicle_maintenance')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'wwjcar'
  AND tablename IN ('vehicle_bookings', 'booking_statuses', 'vehicle_maintenance')
ORDER BY tablename, indexname;

SELECT
  event_object_table AS table_name,
  trigger_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'wwjcar'
  AND event_object_table IN ('vehicle_bookings', 'booking_statuses', 'vehicle_maintenance')
ORDER BY event_object_table, trigger_name, event_manipulation;

SELECT
  vehicle_bookings.id,
  vehicle_bookings.vehicle_id,
  vehicle_bookings.customer_name,
  vehicle_bookings.customer_phone,
  vehicle_bookings.start_date,
  vehicle_bookings.end_date,
  vehicle_bookings.status
FROM vehicle_bookings
ORDER BY vehicle_bookings.start_date DESC, vehicle_bookings.id DESC
LIMIT 20;

SELECT
  vehicle_maintenance.id,
  vehicle_maintenance.vehicle_id,
  vehicle_maintenance.start_date,
  vehicle_maintenance.end_date,
  vehicle_maintenance.reason,
  vehicle_maintenance.status
FROM vehicle_maintenance
ORDER BY vehicle_maintenance.start_date DESC, vehicle_maintenance.id DESC
LIMIT 20;

-- Expected failure: overlapping active booking for the same vehicle.
-- Replace :vehicle_id with a real vehicle id before running manually.
-- INSERT INTO vehicle_bookings (vehicle_id, customer_name, customer_phone, start_date, end_date, status)
-- VALUES (:vehicle_id, 'Overlap Test', '0800000001', CURRENT_DATE + 7, CURRENT_DATE + 8, 'reserved');
