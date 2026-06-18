SET search_path TO wwjcar, public;

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

INSERT INTO vehicle_bookings (
  vehicle_id,
  customer_name,
  customer_phone,
  start_date,
  end_date,
  status,
  note
)
SELECT
  cars.id,
  'Sample Customer',
  '0800000000',
  CURRENT_DATE + 7,
  CURRENT_DATE + 9,
  'reserved',
  'Sample booking for fleet availability verification'
FROM cars
WHERE cars.status = 'published'
ORDER BY cars.id
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO vehicle_maintenance (
  vehicle_id,
  start_date,
  end_date,
  reason,
  status
)
SELECT
  cars.id,
  CURRENT_DATE + 14,
  CURRENT_DATE + 15,
  'Sample scheduled inspection',
  'maintenance'
FROM cars
WHERE cars.status = 'published'
ORDER BY cars.id DESC
LIMIT 1
ON CONFLICT DO NOTHING;
