require('dotenv').config();
const axios = require('axios');
const db = require('../config/db');

async function run() {
  const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const client = axios.create({ baseURL: base, timeout: 8000, maxRedirects: 5 });

  try {
    // ensure we have a categoria
    const [cats] = await db.query('SELECT id FROM categorias LIMIT 1');
    let categoriaId;
    if (cats && cats.length) {
      categoriaId = cats[0].id;
    } else {
      const [res] = await db.query('INSERT INTO categorias (nome) VALUES (?)', ['Teste (automático)']);
      categoriaId = res.insertId;
    }

    const titulo = process.env.TEST_TITLE || ('TEST OMDB ' + Date.now());
    const payload = new URLSearchParams();
    payload.append('titulo', titulo);
    payload.append('ano', '1999');
    payload.append('categoria_id', String(categoriaId));
    payload.append('imagem_url', '');

    console.log('Enviando POST para criar filme:', titulo);
    const resp = await client.post('/filmes/salvar', payload.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    console.log('Resposta HTTP:', resp.status, resp.statusText);

    // Give a moment for DB commit/redirect handling
    await new Promise(r => setTimeout(r, 600));

    const [rows] = await db.query('SELECT * FROM filmes WHERE titulo = ? ORDER BY id DESC LIMIT 1', [titulo]);
    if (!rows || rows.length === 0) {
      console.error('Falha: filme não encontrado no banco após POST.');
      process.exit(2);
    }
    const film = rows[0];
    console.log('Filme criado:', { id: film.id, titulo: film.titulo, imagem: film.imagem, imdb_rating: film.imdb_rating });
    if (film.imagem) console.log('OK: campo `imagem` preenchido.'); else console.warn('Aviso: campo `imagem` vazio.');
    if (film.imdb_rating) console.log('OK: `imdb_rating` preenchido:', film.imdb_rating); else console.warn('Aviso: `imdb_rating` vazio.');
    process.exit(0);
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.error('Conexão recusada ao servidor. Certifique-se de que o app esteja rodando em http://localhost:3000');
      process.exit(3);
    }
    console.error('Erro no teste:', err.message || err);
    process.exit(1);
  }
}

run();
