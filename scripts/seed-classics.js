const db = require('../config/db');

async function run() {
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
    for (const [title, year, genre] of films) {
      const categoria_id = genreIds[genre] || null;
      // avoid duplicates by title and year
      const [exists] = await db.query('SELECT id FROM filmes WHERE titulo = ? AND ano = ?', [title, year]);
      if (exists.length) continue;
      await db.query('INSERT INTO filmes (titulo, ano, categoria_id) VALUES (?, ?, ?)', [title, year, categoria_id]);
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
