const db = require('./config/db');
(async () => {
  try {
    const [rows] = await db.query('SELECT 1+1 AS s');
    console.log('ok', rows);
    process.exit(0);
  } catch (e) {
    console.error('err', e);
    process.exit(1);
  }
})();