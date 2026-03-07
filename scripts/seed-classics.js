const db = require('../config/db');

const waitForDb = require('./wait-db');

async function run() {
  await waitForDb();
  // Ensure tables exist (idempotent) so seed can run even on a fresh DB
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL
      ) ENGINE=InnoDB;
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS filmes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(150) NOT NULL,
        ano INT,
        categoria_id INT,
        imagem VARCHAR(255) NULL,
        imdb_rating VARCHAR(16) NULL,
        INDEX (categoria_id),
        CONSTRAINT fk_filmes_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  } catch (ensureErr) {
    console.warn('Could not ensure tables exist (continuing):', ensureErr && ensureErr.message ? ensureErr.message : ensureErr);
  }
  try {
    // Categories (genres)
    const genres = [
      'Drama','Crime','Comedy','Romance','Adventure','Sci-Fi','Fantasy','Horror','Thriller','Western'
    ];

    const genreIds = {};
    for (const g of genres) {
      const [rows] = await db.query('SELECT id FROM categorias WHERE nome = ?', [g]);
      if (rows.length) {
        genreIds[g] = rows[0].id;
      } else {
        const [r] = await db.query('INSERT INTO categorias (nome) VALUES (?)', [g]);
        genreIds[g] = r.insertId;
      }
    }

    // Classic films list: title, year, genre
    const films = [
      ['Casablanca', 1942, 'Romance'],
      ['Citizen Kane', 1941, 'Drama'],
      ['The Godfather', 1972, 'Crime'],
      ['The Godfather: Part II', 1974, 'Crime'],
      ['Psycho', 1960, 'Horror'],
      ['Gone with the Wind', 1939, 'Drama'],
      ['Lawrence of Arabia', 1962, 'Adventure'],
      ['2001: A Space Odyssey', 1968, 'Sci-Fi'],
      ['Star Wars', 1977, 'Sci-Fi'],
      ['The Wizard of Oz', 1939, 'Fantasy'],
      ['The Shawshank Redemption', 1994, 'Drama'],
      ['Pulp Fiction', 1994, 'Crime'],
      ['Schindler\'s List', 1993, 'Drama'],
      ['The Good, the Bad and the Ugly', 1966, 'Western'],
      ['Singin\' in the Rain', 1952, 'Comedy'],
      ['Vertigo', 1958, 'Thriller'],
      ['The Matrix', 1999, 'Sci-Fi'],
      ['Some Like It Hot', 1959, 'Comedy'],
      ['Apocalypse Now', 1979, 'Drama'],
      ['The Seventh Seal', 1957, 'Drama']
    ];

    let inserted = 0;
    const omdbKey = process.env.OMDB_API_KEY;
    const { fetchPosterAndRating } = require('../utils/omdb');
    for (const [title, year, genre] of films) {
      const categoria_id = genreIds[genre] || null;
      // avoid duplicates by title and year
      const [exists] = await db.query('SELECT id FROM filmes WHERE titulo = ? AND ano = ?', [title, year]);
      if (exists.length) continue;

      let poster = null;
      let imdbRating = null;
      if (omdbKey) {
        try {
          const result = await fetchPosterAndRating(title, year, omdbKey);
          poster = result.poster;
          imdbRating = result.imdbRating;
        } catch (e) {
          console.warn('OMDb lookup failed for', title, e && e.message ? e.message : e);
        }
        // be polite to the API
        await new Promise(r => setTimeout(r, 250));
      }

      try {
        await db.query('INSERT INTO filmes (titulo, ano, categoria_id, imagem, imdb_rating) VALUES (?, ?, ?, ?, ?)', [title, year, categoria_id, poster, imdbRating]);
      } catch (insErr) {
        console.warn('Failed to insert', title, insErr && insErr.message ? insErr.message : insErr);
      }
      inserted++;
    }

    console.log(`Seed concluído. Gêneros garantidos: ${genres.length}. Filmes inseridos: ${inserted}`);
    process.exit(0);
  } catch (err) {
    console.error('Erro no seed:', err);
    process.exit(1);
  }
}

run();
