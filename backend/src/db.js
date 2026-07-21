import pg from 'pg';

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

export async function checkDbConnection() {
  const p = getPool();
  if (!p) return { connected: false, reason: 'DATABASE_URL not configured' };
  try {
    await p.query('SELECT 1');
    return { connected: true };
  } catch (err) {
    return { connected: false, reason: err.message };
  }
}

/**
 * Converts a JS number array into a Postgres pgvector literal string,
 * e.g. [0.12, -0.03] -> "[0.12,-0.03]". Pass this as a query parameter
 * alongside an explicit `::vector` cast in the SQL — no extra npm
 * package needed for pgvector support.
 */
export function toVectorLiteral(values) {
  return `[${values.join(',')}]`;
}