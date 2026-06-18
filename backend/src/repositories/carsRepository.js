import { pool } from '../db/pool.js';
import { asBoolean, parseJson, toJson } from '../utils/rowUtils.js';

function mapCar(row) {
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    image: row.cover_image_url,
    coverImage: row.cover_image_url,
    pricePerDay: row.price_per_day,
    transmission: row.transmission,
    seats: row.seats,
    fuel: row.fuel,
    description: row.description || '',
    categories: parseJson(row.categories, []),
    suitableFor: parseJson(row.suitable_for, []),
    luggage: row.luggage,
    featured: asBoolean(row.featured),
    airportPickup: asBoolean(row.airport_pickup),
    monthlyRental: asBoolean(row.monthly_rental),
    status: row.status,
    sortOrder: row.sort_order,
    gallery: parseJson(row.gallery, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapImage(row) {
  if (!row) return null;

  return {
    id: row.id,
    carId: row.car_id,
    uploadId: row.upload_id,
    imageUrl: row.image_url,
    altText: row.alt_text || '',
    sortOrder: row.sort_order,
    isCover: asBoolean(row.is_cover),
    publicId: row.public_id,
    secureUrl: row.secure_url,
    width: row.width,
    height: row.height,
    format: row.format,
    bytes: row.bytes,
    resourceType: row.resource_type,
    createdAt: row.created_at
  };
}

const carsSelect = `cars.*,
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id', car_images.id,
          'car_id', car_images.car_id,
          'upload_id', car_images.upload_id,
          'image_url', car_images.image_url,
          'alt_text', car_images.alt_text,
          'sort_order', car_images.sort_order,
          'is_cover', car_images.is_cover,
          'public_id', uploads.public_id,
          'secure_url', uploads.secure_url,
          'width', uploads.width,
          'height', uploads.height,
          'format', uploads.format,
          'bytes', uploads.bytes,
          'resource_type', uploads.resource_type,
          'created_at', car_images.created_at
        )
        ORDER BY car_images.is_cover DESC, car_images.sort_order ASC, car_images.id ASC
      )
      FROM car_images
      LEFT JOIN uploads ON uploads.id = car_images.upload_id
      WHERE car_images.car_id = cars.id
    ),
    '[]'::json
  ) AS gallery`;

function orderBy(sort) {
  if (sort === 'price_desc') return 'price_per_day DESC, sort_order ASC';
  if (sort === 'price_asc') return 'price_per_day ASC, sort_order ASC';
  if (sort === 'name') return 'name ASC';
  return 'featured DESC, sort_order ASC, id ASC';
}

export const carsRepository = {
  async list(filters = {}) {
    const where = [];
    const values = [];

    if (!filters.includeDrafts) where.push("status = 'published'");
    if (filters.brand) {
      where.push('brand = ?');
      values.push(filters.brand);
    }
    if (filters.transmission) {
      where.push('transmission = ?');
      values.push(filters.transmission);
    }
    if (filters.search) {
      where.push('(name ILIKE ? OR brand ILIKE ? OR description ILIKE ?)');
      values.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    const page = Math.max(Number(filters.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(filters.pageSize) || 100, 1), 100);
    const offset = (page - 1) * pageSize;
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT ${carsSelect} FROM cars ${whereSql} ORDER BY ${orderBy(filters.sort)} LIMIT ? OFFSET ?`,
      [...values, pageSize, offset]
    );
    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM cars ${whereSql}`, values);

    return { items: rows.map(mapCar), total: countRows[0]?.total || 0 };
  },

  async findBySlug(slug, includeDrafts = false) {
    const [rows] = await pool.query(
      `SELECT ${carsSelect} FROM cars WHERE slug = ? ${includeDrafts ? '' : "AND status = 'published'"} LIMIT 1`,
      [slug]
    );
    return mapCar(rows[0]);
  },

  async create(payload) {
    const [insertRows] = await pool.query(
      `INSERT INTO cars
       (slug, name, brand, cover_image_url, price_per_day, transmission, seats, fuel, description,
        categories, suitable_for, luggage, featured, airport_pickup, monthly_rental, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id`,
      [
        payload.slug,
        payload.name,
        payload.brand,
        payload.coverImage || payload.image || null,
        Number(payload.pricePerDay) || 0,
        payload.transmission || 'Automatic',
        Number(payload.seats) || 5,
        payload.fuel || 'Petrol',
        payload.description || '',
        toJson(payload.categories),
        toJson(payload.suitableFor),
        Number(payload.luggage) || 2,
        payload.featured ? 1 : 0,
        payload.airportPickup ? 1 : 0,
        payload.monthlyRental ? 1 : 0,
        payload.status || 'published',
        Number(payload.sortOrder) || 0
      ]
    );

    const [rows] = await pool.query(`SELECT ${carsSelect} FROM cars WHERE id = ?`, [insertRows[0].id]);
    return mapCar(rows[0]);
  },

  async update(id, payload) {
    await pool.query(
      `UPDATE cars SET
       slug = ?, name = ?, brand = ?, cover_image_url = ?, price_per_day = ?, transmission = ?,
       seats = ?, fuel = ?, description = ?, categories = ?, suitable_for = ?,
       luggage = ?, featured = ?, airport_pickup = ?, monthly_rental = ?, status = ?, sort_order = ?
       WHERE id = ?`,
      [
        payload.slug,
        payload.name,
        payload.brand,
        payload.coverImage || payload.image || null,
        Number(payload.pricePerDay) || 0,
        payload.transmission || 'Automatic',
        Number(payload.seats) || 5,
        payload.fuel || 'Petrol',
        payload.description || '',
        toJson(payload.categories),
        toJson(payload.suitableFor),
        Number(payload.luggage) || 2,
        payload.featured ? 1 : 0,
        payload.airportPickup ? 1 : 0,
        payload.monthlyRental ? 1 : 0,
        payload.status || 'published',
        Number(payload.sortOrder) || 0,
        id
      ]
    );
    const [rows] = await pool.query(`SELECT ${carsSelect} FROM cars WHERE id = ?`, [id]);
    return mapCar(rows[0]);
  },

  async setCoverImage(id, upload) {
    await pool.query('UPDATE cars SET cover_image_url = ? WHERE id = ?', [upload.secureUrl || upload.fileUrl, id]);
    await pool.query('UPDATE car_images SET is_cover = FALSE WHERE car_id = ?', [id]);
    const [existingRows] = await pool.query('SELECT id FROM car_images WHERE car_id = ? AND upload_id = ? LIMIT 1', [id, upload.id]);
    if (existingRows[0]) {
      await pool.query('UPDATE car_images SET image_url = ?, alt_text = ?, is_cover = TRUE WHERE id = ?', [
        upload.secureUrl || upload.fileUrl,
        upload.originalName,
        existingRows[0].id
      ]);
    } else {
      await pool.query(
        'INSERT INTO car_images (car_id, upload_id, image_url, alt_text, sort_order, is_cover) VALUES (?, ?, ?, ?, 0, TRUE)',
        [id, upload.id, upload.secureUrl || upload.fileUrl, upload.originalName]
      );
    }
    const [rows] = await pool.query(`SELECT ${carsSelect} FROM cars WHERE id = ?`, [id]);
    return mapCar(rows[0]);
  },

  async addGalleryImage(id, upload, payload = {}) {
    const [insertRows] = await pool.query(
      'INSERT INTO car_images (car_id, upload_id, image_url, alt_text, sort_order, is_cover) VALUES (?, ?, ?, ?, ?, FALSE) RETURNING id',
      [id, upload.id, upload.secureUrl || upload.fileUrl, payload.altText || upload.originalName, Number(payload.sortOrder) || 0]
    );
    const [rows] = await pool.query('SELECT * FROM car_images WHERE id = ?', [insertRows[0].id]);
    return mapImage(rows[0]);
  },

  async findImageById(id) {
    const [rows] = await pool.query(
      `SELECT car_images.*, uploads.public_id, uploads.secure_url, uploads.width, uploads.height,
        uploads.format, uploads.bytes, uploads.resource_type
       FROM car_images
       LEFT JOIN uploads ON uploads.id = car_images.upload_id
       WHERE car_images.id = ?
       LIMIT 1`,
      [id]
    );
    return mapImage(rows[0]);
  },

  async findCoverImageByCarId(carId) {
    const [rows] = await pool.query(
      `SELECT car_images.*, uploads.public_id, uploads.secure_url, uploads.width, uploads.height,
        uploads.format, uploads.bytes, uploads.resource_type
       FROM car_images
       LEFT JOIN uploads ON uploads.id = car_images.upload_id
       WHERE car_images.car_id = ? AND car_images.is_cover = TRUE
       LIMIT 1`,
      [carId]
    );
    return mapImage(rows[0]);
  },

  async replaceImage(id, upload, payload = {}) {
    const current = await this.findImageById(id);
    if (!current) return null;

    await pool.query(
      `UPDATE car_images
       SET upload_id = ?, image_url = ?, alt_text = COALESCE(?, alt_text)
       WHERE id = ?`,
      [upload.id, upload.secureUrl || upload.fileUrl, payload.altText || upload.originalName || null, id]
    );

    if (current.isCover) {
      await pool.query('UPDATE cars SET cover_image_url = ? WHERE id = ?', [upload.secureUrl || upload.fileUrl, current.carId]);
    }

    return this.findImageById(id);
  },

  async reorderGallery(carId, images = []) {
    for (const image of images) {
      await pool.query(
        'UPDATE car_images SET sort_order = ? WHERE id = ? AND car_id = ?',
        [Number(image.sortOrder) || 0, image.id, carId]
      );
    }

    const [rows] = await pool.query(
      `SELECT car_images.*, uploads.public_id, uploads.secure_url, uploads.width, uploads.height,
        uploads.format, uploads.bytes, uploads.resource_type
       FROM car_images
       LEFT JOIN uploads ON uploads.id = car_images.upload_id
       WHERE car_images.car_id = ?
       ORDER BY car_images.is_cover DESC, car_images.sort_order ASC, car_images.id ASC`,
      [carId]
    );
    return rows.map(mapImage);
  },

  async deleteImage(id) {
    const image = await this.findImageById(id);
    await pool.query('DELETE FROM car_images WHERE id = ?', [id]);
    return image;
  },

  async delete(id) {
    await pool.query('DELETE FROM cars WHERE id = ?', [id]);
  }
};
