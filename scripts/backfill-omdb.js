require('dotenv').config();
const db = require('../config/db');
const omdb = require('../utils/omdb');

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function run() {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) {
    console.error('OMDB_API_KEY não encontrado em .env');
    process.exit(1);
  }

  console.log('Buscando filmes sem imagem...');
  const [filmes] = await db.query(
    "SELECT id, titulo, ano FROM filmes WHERE imagem IS NULL OR imagem = '' OR imagem = 'N/A'"
  );

  console.log(`Encontrados ${filmes.length} filmes sem imagem.`);
  let updated = 0;

  for (const f of filmes) {
    try {
      console.log(`Processando [${f.id}] ${f.titulo} (${f.ano || 'ano desconhecido'})`);
      const { poster, imdbRating } = await omdb.fetchPosterAndRating(f.titulo, f.ano, apiKey);

      if (poster || imdbRating) {
        await db.query(
          'UPDATE filmes SET imagem = ?, imdb_rating = ? WHERE id = ?',
          [poster || null, imdbRating || null, f.id]
        );
        updated++;
        console.log(`  Atualizado: imagem=${poster ? poster : 'N/A'} imdb=${imdbRating ? imdbRating : 'N/A'}`);
      } else {
        console.log('  Nenhum dado OMDb encontrado. Pulando.');
      }

      // pequeno intervalo para evitar throttling
      await sleep(500);
    } catch (err) {
      console.error(`  Erro ao processar id=${f.id}:`, err.message || err);
    }
  }

  console.log(`Backfill concluído. Filmes atualizados: ${updated}/${filmes.length}`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});
