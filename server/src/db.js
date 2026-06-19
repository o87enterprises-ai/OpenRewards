const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const query = (text, params = []) => pool.query(text, params);

pool.on('error', (err) => {
  console.error('Unexpected database error:', err.message);
});

module.exports = { pool, query };
