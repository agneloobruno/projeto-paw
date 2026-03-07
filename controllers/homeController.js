const Filme = require('../models/filme');
const Categoria = require('../models/categoria');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

exports.index = async (req, res) => {
  try {
    console.log('HOME: start handling');
    const filmes = await Filme.listarRecentes(8);
    console.log('HOME: fetched filmes count=', Array.isArray(filmes) ? filmes.length : typeof filmes);
    const categorias = await Categoria.listarTodas();
    console.log('HOME: fetched categorias count=', Array.isArray(categorias) ? categorias.length : typeof categorias);
    // attach counts for categories
    const categoriasWithCount = await Promise.all(categorias.map(async (c) => {
      console.log('HOME: counting for categoria', c.id);
      const cnt = await Filme.contarPorCategoria(c.id);
      console.log('HOME: count for', c.id, '=', cnt);
      return { ...c, count: cnt };
    }));

    // Normalize relative image paths
    const host = req.get('host');
    const protocol = req.protocol;
    filmes.forEach(f => {
      if (f.imagem && f.imagem.startsWith('/')) {
        f.imagem = `${protocol}://${host}${f.imagem}`;
      }
    });

    console.log('HOME: rendering home, filmes count=', Array.isArray(filmes) ? filmes.length : typeof filmes);
    const omdbKeyPresent = !!process.env.OMDB_API_KEY;
    // detect whether seed script was already run (marker file)
    const seedMarker = path.join(__dirname, '..', '.seed_done');
    const seedDone = fs.existsSync(seedMarker);
    res.render('index', { title: 'Home', filmes, categorias: categoriasWithCount, omdbKeyPresent, seedDone });
  } catch (err) {
    console.error('Error in homeController.index:', err);
    req.flash('error_msg', 'Erro ao carregar home. Verifique a conexão com o banco.');
    // Render the index with empty data to avoid redirect loop
    // Ensure `omdbKeyPresent` is always provided to the template
    const seedMarker = path.join(__dirname, '..', '.seed_done');
    const seedDone = fs.existsSync(seedMarker);
    res.status(500).render('index', { title: 'Home', filmes: [], categorias: [], omdbKeyPresent: !!process.env.OMDB_API_KEY, seedDone });
  }
};

exports.flashTest = (req, res) => {
  req.flash('success_msg', 'Operação realizada com sucesso.');
  res.redirect('/');
};

// Save OMDb API key to .env (overwrites or appends). Returns JSON.
exports.saveOmdbKey = async (req, res) => {
  try {
    const key = (req.body && req.body.key) ? String(req.body.key).trim() : '';
    if (!key || key.length < 5) {
      return res.status(400).json({ ok: false, message: 'Chave inválida' });
    }
    const envPath = path.join(__dirname, '..', '.env');
    let content = '';
    if (fs.existsSync(envPath)) content = fs.readFileSync(envPath, 'utf8');
    const re = /^OMDB_API_KEY=.*$/m;
    if (re.test(content)) {
      content = content.replace(re, `OMDB_API_KEY=${key}`);
    } else {
      if (content.length && !content.endsWith('\n')) content += '\n';
      content += `OMDB_API_KEY=${key}\n`;
    }
    fs.writeFileSync(envPath, content, 'utf8');
    // update runtime env
    process.env.OMDB_API_KEY = key;
    console.log('OMDb key saved via web UI');
    // kick off a background job to fill posters/ratings
    try {
      console.log('Starting fill-posters job...');
      exec('node scripts/fill-posters.js', { cwd: path.join(__dirname, '..'), maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
        if (err) {
          console.error('fill-posters failed:', err, stderr);
        } else {
          console.log('fill-posters finished:', stdout ? stdout.toString().slice(0, 200) : '');
        }
      });
    } catch (bgErr) {
      console.error('Failed to start fill-posters:', bgErr);
    }

    return res.json({ ok: true, startedFill: true });
  } catch (err) {
    console.error('Error saving OMDb key:', err);
    return res.status(500).json({ ok: false, message: 'Erro ao salvar chave' });
  }
};

// Run seed-classics script and return output
exports.runSeedClassics = async (req, res) => {
  try {
    if (!process.env.OMDB_API_KEY) {
      return res.status(400).json({ ok: false, message: 'OMDb API key required' });
    }
    const cmd = 'node scripts/seed-classics.js';
    exec(cmd, { cwd: path.join(__dirname, '..'), maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        console.error('Seed error:', err);
        return res.status(500).json({ ok: false, message: 'Erro no seed', stderr: stderr || err.message });
      }
        // mark seed as done
        try {
          const marker = path.join(__dirname, '..', '.seed_done');
          fs.writeFileSync(marker, new Date().toISOString(), 'utf8');
        } catch (werr) {
          console.error('Could not write seed marker:', werr);
        }
        return res.json({ ok: true, output: stdout });
    });
  } catch (err) {
    console.error('runSeedClassics error:', err);
    return res.status(500).json({ ok: false, message: 'Erro interno' });
  }
};
