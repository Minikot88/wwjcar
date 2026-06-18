import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { env } from '../src/config/env.js';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../database/migrations');

const resetTables = [
  'contract_attachments',
  'vehicle_expenses',
  'contracts',
  'customer_notes',
  'customers',
  'vehicle_maintenance',
  'vehicle_bookings',
  'booking_statuses',
  'car_images',
  'refresh_tokens',
  'uploads',
  'faqs',
  'faq_categories',
  'reviews',
  'rental_conditions',
  'pages',
  'site_settings',
  'cars',
  'users',
  'schema_migrations'
];

function getDatabaseUrl(database = env.database.name) {
  if (env.database.url) {
    const url = new URL(env.database.url);
    url.pathname = `/${database}`;
    return url.toString();
  }

  const password = encodeURIComponent(env.database.password);
  return `postgresql://${env.database.user}:${password}@${env.database.host}:${env.database.port}/${database}`;
}

async function createClient(database = env.database.name) {
  const client = new Client({ connectionString: getDatabaseUrl(database) });
  await client.connect();
  return client;
}

async function databaseExists() {
  const client = await createClient('postgres');
  try {
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [env.database.name]);
    return result.rowCount > 0;
  } finally {
    await client.end();
  }
}

async function ensureDatabase() {
  if (await databaseExists()) return;

  const client = await createClient('postgres');
  try {
    await client.query(`CREATE DATABASE "${env.database.name}"`);
    console.log(`Created database: ${env.database.name}`);
  } finally {
    await client.end();
  }
}

async function run() {
  await ensureDatabase();
  const client = await createClient(env.database.name);

  try {
    await client.query('CREATE SCHEMA IF NOT EXISTS wwjcar');
    await client.query('SET search_path TO wwjcar, public');

    if (process.argv.includes('--reset')) {
      for (const table of resetTables) {
        await client.query(`DROP TABLE IF EXISTS wwjcar."${table}" CASCADE`);
      }
      await client.query('DROP FUNCTION IF EXISTS wwjcar.set_updated_at() CASCADE');
      console.log('Database reset complete');
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS wwjcar.schema_migrations (
        id BIGSERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const appliedResult = await client.query('SELECT filename FROM wwjcar.schema_migrations');
    const applied = new Set(appliedResult.rows.map((row) => row.filename));
    const files = (await fs.readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort();

    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO wwjcar.schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Applied migration: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    console.log('Migrations complete');
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
