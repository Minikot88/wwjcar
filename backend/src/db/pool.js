import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

function connectionConfig() {
  if (env.database.url) {
    return {
      connectionString: env.database.url,
      max: env.database.connectionLimit,
      options: '-c search_path=wwjcar,public'
    };
  }

  return {
    host: env.database.host,
    port: env.database.port,
    database: env.database.name,
    user: env.database.user,
    password: env.database.password,
    max: env.database.connectionLimit,
    options: '-c search_path=wwjcar,public'
  };
}

const pgPool = new Pool(connectionConfig());

function toPostgresQuery(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

export const pool = {
  async query(sql, params = []) {
    const result = await pgPool.query(toPostgresQuery(sql), params);
    const metadata = {
      rowCount: result.rowCount,
      insertId: result.rows[0]?.id
    };
    return [result.rows, metadata];
  },

  async end() {
    await pgPool.end();
  }
};

export async function pingDatabase() {
  await pgPool.query('SELECT 1');
}

export { pgPool };
