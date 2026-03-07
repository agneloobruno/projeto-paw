const Filme = require('../models/filme');
const Categoria = require('../models/categoria');

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
    res.render('index', { title: 'Home', filmes, categorias: categoriasWithCount });
  } catch (err) {
    console.error('Error in homeController.index:', err);
    req.flash('error_msg', 'Erro ao carregar home. Verifique a conexão com o banco.');
    // Render the index with empty data to avoid redirect loop
    res.status(500).render('index', { title: 'Home', filmes: [], categorias: [] });
  }
};

exports.flashTest = (req, res) => {
  req.flash('success_msg', 'Operação realizada com sucesso.');
  res.redirect('/');
};
