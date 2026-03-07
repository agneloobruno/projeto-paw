const db = require('../config/db');
const waitForDb = require('./wait-db');
const { fetchPosterAndRating } = require('../utils/omdb');
require('dotenv').config();

async function run() {
  await waitForDb();
  try {
    const omdbKey = process.env.OMDB_API_KEY;
    if (!omdbKey) {
      console.error('OMDB_API_KEY not set in environment. Aborting.');
      process.exit(1);
    }

    const [rows] = await db.query("SELECT id, titulo, ano FROM filmes WHERE imagem IS NULL OR imdb_rating IS NULL");
    console.log('To update:', rows.length);
    for (const r of rows) {
      try {
        const { poster, imdbRating } = await fetchPosterAndRating(r.titulo, r.ano, omdbKey);
        if (poster || imdbRating) {
          await db.query('UPDATE filmes SET imagem = COALESCE(?, imagem), imdb_rating = COALESCE(?, imdb_rating) WHERE id = ?', [poster, imdbRating, r.id]);
          console.log('Updated', r.titulo, 'poster=', !!poster, 'rating=', !!imdbRating);
        } else {
          console.log('No data for', r.titulo);
        }
      } catch (e) {
        console.warn('Failed for', r.titulo, e && e.message ? e.message : e);
      }
      await new Promise(rp => setTimeout(rp, 250));
    }

    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
