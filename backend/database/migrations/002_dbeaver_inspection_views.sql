SET search_path TO wwjcar, public;

CREATE OR REPLACE VIEW car_inventory_view AS
SELECT
  id,
  slug,
  name,
  brand,
  price_per_day,
  transmission,
  seats,
  fuel,
  luggage,
  featured,
  airport_pickup,
  monthly_rental,
  status,
  sort_order,
  cover_image_url,
  created_at,
  updated_at
FROM cars;

CREATE OR REPLACE VIEW faq_with_categories_view AS
SELECT
  faqs.id,
  faq_categories.name AS category_name,
  faq_categories.slug AS category_slug,
  faqs.question,
  faqs.answer,
  faqs.sort_order,
  faqs.status,
  faqs.created_at,
  faqs.updated_at
FROM faqs
LEFT JOIN faq_categories ON faq_categories.id = faqs.category_id;

CREATE OR REPLACE VIEW cms_pages_view AS
SELECT
  id,
  slug,
  title,
  meta_title,
  meta_description,
  canonical,
  status,
  created_at,
  updated_at
FROM pages;

CREATE OR REPLACE VIEW published_reviews_view AS
SELECT
  id,
  customer_name,
  rating,
  content,
  source,
  sort_order,
  created_at,
  updated_at
FROM reviews
WHERE status = 'published';
