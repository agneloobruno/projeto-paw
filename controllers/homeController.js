const Filme = require('../models/filme');
const Categoria = require('../models/categoria');

exports.index = async (req, res) => {
  try {
    const filmes = await Filme.listarRecentes(8);
    const categorias = await Categoria.listarTodas();
    // attach counts for categories
    const categoriasWithCount = await Promise.all(categorias.map(async (c) => {
      const cnt = await Filme.contarPorCategoria(c.id);
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

    console.log('HOME: filmes count=', Array.isArray(filmes) ? filmes.length : typeof filmes);
    res.render('index', { title: 'Home', filmes, categorias: categoriasWithCount });
  } catch (err) {
    req.flash('error_msg', 'Erro ao carregar home.');
    res.redirect('/');
  }
};

exports.flashTest = (req, res) => {
  req.flash('success_msg', 'Operação realizada com sucesso.');
  res.redirect('/');
};
