const mysql = require('mysql2/promise');
require('dotenv').config();

async function waitForDb({ retries = 15, delayMs = 2000 } = {}) {
  const cfg = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  };

  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mysql.createConnection(cfg);
      await conn.ping();
      await conn.end();
      return true;
    } catch (err) {
      const attempt = i + 1;
      console.log(`DB not ready (attempt ${attempt}/${retries}): ${err && err.message ? err.message : err}`);
      if (attempt >= retries) break;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error('Database did not become ready in time');
}

module.exports = waitForDb;

if (require.main === module) {
  (async () => {
    try {
      console.log('Aguardando banco de dados...');
      await waitForDb();
      console.log('Banco de dados pronto.');
      process.exit(0);
    } catch (err) {
      console.error('Erro ao aguardar DB:', err && err.message ? err.message : err);
      process.exit(1);
    }
  })();
}
