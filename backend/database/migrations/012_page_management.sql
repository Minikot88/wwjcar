ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS updated_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

ALTER TABLE pages
  DROP CONSTRAINT IF EXISTS pages_status_check;

ALTER TABLE pages
  ADD CONSTRAINT pages_status_check CHECK (status IN ('draft', 'published', 'hidden', 'archived'));

ALTER TABLE pages
  DROP CONSTRAINT IF EXISTS pages_slug_key;

UPDATE pages
SET published_at = COALESCE(published_at, created_at)
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS pages_deleted_at_index ON pages(deleted_at);
CREATE INDEX IF NOT EXISTS pages_updated_by_index ON pages(updated_by);
CREATE INDEX IF NOT EXISTS pages_published_at_index ON pages(published_at);
CREATE UNIQUE INDEX IF NOT EXISTS pages_slug_active_unique ON pages(slug) WHERE deleted_at IS NULL;

INSERT INTO pages (slug, title, meta_title, meta_description, content_json, status, published_at)
VALUES
  ('home', 'หน้าแรก', 'รถเช่าหาดใหญ่ | WWJ Car Rent', 'รถเช่าหาดใหญ่ ราคาดี รับรถสนามบินหาดใหญ่ จองง่ายผ่าน LINE', '{}'::jsonb, 'published', CURRENT_TIMESTAMP),
  ('about-us', 'เกี่ยวกับเรา', 'เกี่ยวกับ WWJ Car Rent', 'รู้จัก WWJ Car Rent บริการรถเช่าหาดใหญ่และรับรถสนามบินหาดใหญ่', '{}'::jsonb, 'published', CURRENT_TIMESTAMP),
  ('faq', 'คำถามที่พบบ่อย', 'คำถามที่พบบ่อย | WWJ Car Rent', 'คำถามที่พบบ่อยเกี่ยวกับรถเช่าหาดใหญ่ เอกสาร เงินมัดจำ และการรับรถสนามบิน', '{}'::jsonb, 'published', CURRENT_TIMESTAMP),
  ('rental-conditions', 'เงื่อนไขการเช่า', 'เงื่อนไขการเช่ารถ | WWJ Car Rent', 'เอกสาร เงินมัดจำ ประกันภัย น้ำมัน และเงื่อนไขการคืนรถของ WWJ Car Rent', '{}'::jsonb, 'published', CURRENT_TIMESTAMP),
  ('contact', 'ติดต่อเรา', 'ติดต่อ WWJ Car Rent', 'ติดต่อ WWJ Car Rent เพื่อสอบถามรถเช่าหาดใหญ่และรับรถสนามบินหาดใหญ่', '{}'::jsonb, 'published', CURRENT_TIMESTAMP),
  ('reviews', 'รีวิวลูกค้า', 'รีวิวลูกค้า | WWJ Car Rent', 'รีวิวจากลูกค้าที่ใช้บริการ WWJ Car Rent รถเช่าหาดใหญ่', '{}'::jsonb, 'published', CURRENT_TIMESTAMP),
  ('privacy-policy', 'นโยบายความเป็นส่วนตัว', 'นโยบายความเป็นส่วนตัว | WWJ Car Rent', 'นโยบายความเป็นส่วนตัวของ WWJ Car Rent เกี่ยวกับการเก็บ ใช้งาน และคุ้มครองข้อมูลส่วนบุคคลของลูกค้า', '{}'::jsonb, 'published', CURRENT_TIMESTAMP),
  ('terms-and-conditions', 'ข้อกำหนดและเงื่อนไขการใช้บริการ', 'ข้อกำหนดและเงื่อนไขการใช้บริการ | WWJ Car Rent', 'ข้อกำหนดและเงื่อนไขการใช้บริการรถเช่าของ WWJ Car Rent สำหรับลูกค้าทุกท่าน', '{}'::jsonb, 'published', CURRENT_TIMESTAMP),
  ('blog', 'บทความ', 'บทความรถเช่าหาดใหญ่ | WWJ Car Rent', 'บทความและคู่มือการเช่ารถหาดใหญ่ สนามบินหาดใหญ่ เบตง ปากบารา และสงขลา', '{}'::jsonb, 'published', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
