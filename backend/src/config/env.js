import dotenv from 'dotenv';

dotenv.config({ override: true });

function required(key, fallback = '') {
  const value = process.env[key] || fallback;
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function numberValue(key, fallback) {
  const parsed = Number.parseInt(process.env[key] || '', 10);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function parseCloudinaryUrl(value = '') {
  if (!value) return {};

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'cloudinary:') return {};

    return {
      apiKey: decodeURIComponent(parsed.username || ''),
      apiSecret: decodeURIComponent(parsed.password || ''),
      cloudName: parsed.hostname || ''
    };
  } catch {
    return {};
  }
}

const cloudinaryUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '127.0.0.1',
  port: numberValue('PORT', 4000),
  appUrl: process.env.APP_URL || 'http://localhost:5180',
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5180')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  cookie: {
    sameSite: process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === 'production' ? 'lax' : 'lax'),
    secure: (process.env.COOKIE_SECURE || (process.env.NODE_ENV === 'production' ? 'true' : 'false')) === 'true'
  },
  database: {
    url: required('DATABASE_URL', ''),
    host: process.env.DB_HOST || '127.0.0.1',
    port: numberValue('DB_PORT', 5432),
    name: process.env.DB_NAME || 'wwjcar',
    user: process.env.DB_USER || 'wwjcar_app',
    password: process.env.DB_PASSWORD || '',
    connectionLimit: numberValue('DB_CONNECTION_LIMIT', 10)
  },
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev-access-secret-change-me'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),
    issuer: process.env.JWT_ISSUER || 'wwj-car-rent-api',
    audience: process.env.JWT_AUDIENCE || 'wwj-car-rent-admin',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@wwjcarrent.local',
    password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
    name: process.env.ADMIN_NAME || 'WWJ Admin'
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || cloudinaryUrl.cloudName || '',
    apiKey: process.env.CLOUDINARY_API_KEY || cloudinaryUrl.apiKey || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || cloudinaryUrl.apiSecret || '',
    folder: process.env.CLOUDINARY_FOLDER || 'wwj-car-rent'
  },
  rateLimit: {
    windowMs: numberValue('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    max: numberValue('RATE_LIMIT_MAX', 300),
    authMax: numberValue('AUTH_RATE_LIMIT_MAX', 20)
  },
  backups: {
    dir: process.env.BACKUP_DIR || '/home/ubuntu/infra/backups/wwjcar'
  },
  docker: {
    postgresContainer: process.env.POSTGRES_CONTAINER || 'server-postgres'
  }
};
