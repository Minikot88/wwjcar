SET search_path TO wwjcar, public;

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS image_upload_id BIGINT NULL REFERENCES uploads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(700) NULL;

CREATE INDEX IF NOT EXISTS reviews_image_upload_id_index ON reviews(image_upload_id);
CREATE INDEX IF NOT EXISTS car_images_sort_order_index ON car_images(car_id, sort_order);
