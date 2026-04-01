const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required but not set.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function connectWithRetry(retries = 3, delay = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log(`Database connection successful on attempt ${attempt}`);
      return pool;
    } catch (err) {
      console.warn(`Database connection attempt ${attempt} failed:`, err.message);
      if (attempt === retries) {
        throw new Error(`Failed to connect to database after ${retries} attempts`);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function connectDB() {
  await connectWithRetry();
}

async function disconnectDB() {
  await pool.end();
  console.log('Database connection pool closed.');
}

async function healthCheck() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT 1');
    client.release();
    return res.rowCount === 1;
  } catch (err) {
    console.error('Health check failed:', err.message);
    return false;
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  healthCheck,
};