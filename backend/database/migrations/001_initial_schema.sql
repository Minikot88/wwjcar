CREATE SCHEMA IF NOT EXISTS wwjcar;
SET search_path TO wwjcar, public;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
  status VARCHAR(40) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  last_login_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_index ON refresh_tokens(user_id);

CREATE TABLE IF NOT EXISTS cars (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(190) NOT NULL UNIQUE,
  name VARCHAR(190) NOT NULL,
  brand VARCHAR(120) NOT NULL,
  cover_image_url VARCHAR(600) NULL,
  price_per_day INTEGER NOT NULL DEFAULT 0 CHECK (price_per_day >= 0),
  transmission VARCHAR(80) NOT NULL DEFAULT 'Automatic',
  seats SMALLINT NOT NULL DEFAULT 5 CHECK (seats > 0),
  fuel VARCHAR(80) NOT NULL DEFAULT 'Petrol',
  description TEXT NULL,
  categories JSONB NULL,
  suitable_for JSONB NULL,
  luggage SMALLINT NOT NULL DEFAULT 2 CHECK (luggage >= 0),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  airport_pickup BOOLEAN NOT NULL DEFAULT TRUE,
  monthly_rental BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(40) NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS cars_brand_index ON cars(brand);
CREATE INDEX IF NOT EXISTS cars_status_index ON cars(status);
CREATE INDEX IF NOT EXISTS cars_featured_index ON cars(featured);
CREATE INDEX IF NOT EXISTS cars_search_index ON cars USING GIN (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, '')));

CREATE TABLE IF NOT EXISTS uploads (
  id BIGSERIAL PRIMARY KEY,
  public_id VARCHAR(255) NULL,
  original_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(700) NOT NULL,
  secure_url VARCHAR(700) NULL,
  mime_type VARCHAR(120) NULL,
  size_bytes BIGINT NULL CHECK (size_bytes IS NULL OR size_bytes >= 0),
  width INTEGER NULL CHECK (width IS NULL OR width >= 0),
  height INTEGER NULL CHECK (height IS NULL OR height >= 0),
  usage_type VARCHAR(80) NOT NULL DEFAULT 'general',
  created_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS uploads_usage_type_index ON uploads(usage_type);
CREATE INDEX IF NOT EXISTS uploads_created_by_index ON uploads(created_by);

CREATE TABLE IF NOT EXISTS car_images (
  id BIGSERIAL PRIMARY KEY,
  car_id BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  upload_id BIGINT NULL REFERENCES uploads(id) ON DELETE SET NULL,
  image_url VARCHAR(700) NOT NULL,
  alt_text VARCHAR(255) NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS car_images_car_id_index ON car_images(car_id);

CREATE TABLE IF NOT EXISTS site_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key VARCHAR(120) NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pages (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(190) NOT NULL UNIQUE,
  title VARCHAR(220) NOT NULL,
  meta_title VARCHAR(255) NULL,
  meta_description VARCHAR(320) NULL,
  canonical VARCHAR(700) NULL,
  og_title VARCHAR(255) NULL,
  og_description VARCHAR(320) NULL,
  og_image VARCHAR(700) NULL,
  schema_json JSONB NULL,
  content_json JSONB NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS pages_status_index ON pages(status);

CREATE TABLE IF NOT EXISTS faq_categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(190) NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS faqs (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NULL REFERENCES faq_categories(id) ON DELETE SET NULL,
  question VARCHAR(320) NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS faqs_category_id_index ON faqs(category_id);
CREATE INDEX IF NOT EXISTS faqs_status_index ON faqs(status);
CREATE INDEX IF NOT EXISTS faqs_search_index ON faqs USING GIN (to_tsvector('simple', coalesce(question, '') || ' ' || coalesce(answer, '')));

CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  customer_name VARCHAR(160) NOT NULL,
  rating SMALLINT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  content TEXT NOT NULL,
  source VARCHAR(120) NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS reviews_status_index ON reviews(status);

CREATE TABLE IF NOT EXISTS rental_conditions (
  id BIGSERIAL PRIMARY KEY,
  section_key VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(220) NOT NULL,
  content_json JSONB NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS cars_set_updated_at ON cars;
CREATE TRIGGER cars_set_updated_at BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS pages_set_updated_at ON pages;
CREATE TRIGGER pages_set_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS faqs_set_updated_at ON faqs;
CREATE TRIGGER faqs_set_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS reviews_set_updated_at ON reviews;
CREATE TRIGGER reviews_set_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS rental_conditions_set_updated_at ON rental_conditions;
CREATE TRIGGER rental_conditions_set_updated_at BEFORE UPDATE ON rental_conditions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
