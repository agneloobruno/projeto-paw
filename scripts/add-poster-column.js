const db = require('../config/db');

async function run() {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS cnt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'filmes' AND column_name = 'imagem'");
    if (rows[0].cnt === 0) {
      console.log('Adicionando coluna imagem em filmes...');
      await db.query("ALTER TABLE filmes ADD COLUMN imagem VARCHAR(255) NULL");
      console.log('Coluna adicionada.');
    } else {
      console.log('Coluna imagem já existe. Nada a fazer.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Erro ao verificar/alterar tabela filmes:', err.message);
    process.exit(1);
  }
}

run();
