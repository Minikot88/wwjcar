SET search_path TO wwjcar, public;

ALTER TABLE uploads
  ADD COLUMN IF NOT EXISTS format VARCHAR(40) NULL,
  ADD COLUMN IF NOT EXISTS bytes BIGINT NULL CHECK (bytes IS NULL OR bytes >= 0),
  ADD COLUMN IF NOT EXISTS resource_type VARCHAR(40) NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE uploads
SET bytes = COALESCE(bytes, size_bytes)
WHERE bytes IS NULL AND size_bytes IS NOT NULL;

CREATE INDEX IF NOT EXISTS uploads_public_id_index ON uploads(public_id);
CREATE INDEX IF NOT EXISTS uploads_deleted_at_index ON uploads(deleted_at);

DROP TRIGGER IF EXISTS uploads_set_updated_at ON uploads;
CREATE TRIGGER uploads_set_updated_at BEFORE UPDATE ON uploads FOR EACH ROW EXECUTE FUNCTION set_updated_at();
