const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const sqlPath = path.join(__dirname, '..', 'database.sql');
  const waitForDb = require('./wait-db');
  if (!fs.existsSync(sqlPath)) {
    console.error('database.sql not found at', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  // wait for DB to accept connections
  await waitForDb();
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306
  });

  try {
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length);
    for (const stmt of statements) {
      try {
        console.log('Executing statement...');
        await connection.query(stmt);
      } catch (stmtErr) {
        console.warn('Statement failed, continuing:', stmtErr && stmtErr.message ? stmtErr.message : stmtErr);
      }
    }
    console.log('Database script executed (errors ignored where present).');
  } catch (err) {
    console.error('Unexpected error executing SQL script:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

run();
