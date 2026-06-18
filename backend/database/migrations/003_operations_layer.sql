SET search_path TO wwjcar, public;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  actor_email VARCHAR(190) NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(120) NULL,
  metadata JSONB NULL,
  ip_address INET NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS audit_logs_actor_user_id_index ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS audit_logs_entity_index ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_index ON audit_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS database_backups (
  id BIGSERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed')),
  error_message TEXT NULL,
  created_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS database_backups_created_at_index ON database_backups(created_at DESC);

CREATE OR REPLACE VIEW admin_sessions_view AS
SELECT
  refresh_tokens.id,
  refresh_tokens.user_id,
  users.email,
  users.name,
  refresh_tokens.expires_at,
  refresh_tokens.revoked_at,
  refresh_tokens.created_at,
  CASE
    WHEN refresh_tokens.revoked_at IS NOT NULL THEN 'revoked'
    WHEN refresh_tokens.expires_at <= CURRENT_TIMESTAMP THEN 'expired'
    ELSE 'active'
  END AS status
FROM refresh_tokens
JOIN users ON users.id = refresh_tokens.user_id;

CREATE OR REPLACE VIEW audit_timeline_view AS
SELECT
  audit_logs.id,
  audit_logs.actor_email,
  audit_logs.action,
  audit_logs.entity_type,
  audit_logs.entity_id,
  audit_logs.metadata,
  audit_logs.ip_address,
  audit_logs.created_at
FROM audit_logs
ORDER BY audit_logs.created_at DESC;
