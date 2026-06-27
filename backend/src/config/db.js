const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Prevent the whole app from crashing if an idle connection in the pool errors out.
// This is common with cloud Postgres providers like Neon and is safe to just log.
pool.on('error', (err) => {
  console.error('⚠️  Unexpected PG pool error (handled, server still running):', err.message);
});

pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL (Neon)'))
  .catch((err) => console.error('❌ Database connection error:', err.message));

module.exports = pool;