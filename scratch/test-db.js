/* eslint-disable @typescript-eslint/no-require-imports */
const { Pool } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
dotenv.config();

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;
  console.log('Testing connection to:', connectionString.split('@')[1]); // Log only the host part for safety
  const pool = new Pool({ connectionString });
  try {
    const client = await pool.connect();
    console.log('Successfully connected to Neon!');
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0]);
    client.release();
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await pool.end();
  }
}

testConnection();
