/* eslint-disable @typescript-eslint/no-require-imports */
const { Pool } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
dotenv.config();

async function checkUsers() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT count(*) FROM users');
    console.log('User count:', res.rows[0].count);
    if (res.rows[0].count > 0) {
        const users = await client.query('SELECT email, role FROM users LIMIT 5');
        console.log('Sample users:', users.rows);
    }
    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkUsers();
