const db = require('../config/db');

async function run() {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'filmes' AND column_name = 'imdb_rating'");
    if (rows[0].cnt === 0) {
      console.log('Adicionando coluna imdb_rating em filmes...');
      await db.query("ALTER TABLE filmes ADD COLUMN imdb_rating VARCHAR(16) NULL");
      console.log('Coluna adicionada.');
    } else {
      console.log('Coluna imdb_rating já existe. Nada a fazer.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Erro ao verificar/alterar tabela filmes:', err.message);
    process.exit(1);
  }
}

run();
