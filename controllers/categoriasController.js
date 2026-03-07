const Categoria = require('../models/categoria');

exports.index = async (req, res) => {
  try {
    const categorias = await Categoria.listarTodas();
    // attach counts
    const Filme = require('../models/filme');
    const categoriasWithCount = await Promise.all(categorias.map(async (c) => {
      const cnt = await Filme.contarPorCategoria(c.id);
      return { ...c, count: cnt };
    }));

    // Assign a nice image to each category (bank images)
    const images = [
      'https://images.unsplash.com/photo-1505682634904-d7c0b7d7a4d7?auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1517604645673-4ec9a01d77a6?auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1502139214985-9faff7d28b9b?auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1517604634494-6fb1a0a0c6b4?auto=format&fit=crop&w=800&q=60'
    ];

    // Icon mapping by category name (bootstrap-icons)
    const iconMap = {
      'drama': 'bi bi-collection-fill',
      'comedy': 'bi bi-emoji-smile-fill',
      'romance': 'bi bi-heart-fill',
      'action': 'bi bi-lightning-fill',
      'horror': 'bi bi-skull-fill',
      'adventure': 'bi bi-binoculars-fill',
      'fantasy': 'bi bi-stars',
      'crime': 'bi bi-shield-lock-fill',
      'music': 'bi bi-music-note-list',
      'sci-fi': 'bi bi-robot',
      'documentary': 'bi bi-book-half'
    };

    const categoriasWithImage = categoriasWithCount.map((c, i) => ({
      ...c,
      image: c.image || images[i % images.length],
      icon: c.icon || iconMap[(c.nome || '').toLowerCase()] || 'bi bi-film'
    }));

    res.render('categorias/index', { title: 'Categorias', categorias: categoriasWithImage });
  } catch (err) {
    req.flash('error_msg', 'Erro ao listar categorias.');
    res.redirect('/');
  }
};

exports.salvar = async (req, res) => {
  const { nome } = req.body;
  if (!nome || !nome.trim()) {
    req.flash('error_msg', 'Nome é obrigatório.');
    return res.redirect('/categorias');
  }
  try {
    await Categoria.salvar({ nome: nome.trim() });
    req.flash('success_msg', 'Categoria criada.');
    res.redirect('/categorias');
  } catch (err) {
    req.flash('error_msg', 'Erro ao salvar categoria.');
    res.redirect('/categorias');
  }
};

exports.editar = async (req, res) => {
  const id = req.params.id;
  try {
    const categoria = await Categoria.buscarPorId(id);
    if (!categoria) {
      req.flash('error_msg', 'Categoria não encontrada.');
      return res.redirect('/categorias');
    }
    // fetch filmes desta categoria
    const Filme = require('../models/filme');
    const filmes = await Filme.listarPorCategoria(id);
    res.render('categorias/editar', { title: 'Editar Categoria', categoria, filmes });
  } catch (err) {
    req.flash('error_msg', 'Erro ao buscar categoria.');
    res.redirect('/categorias');
  }
};

exports.atualizar = async (req, res) => {
  const { id, nome } = req.body;
  if (!nome || !nome.trim()) {
    req.flash('error_msg', 'Nome é obrigatório.');
    return res.redirect(`/categorias/editar/${id}`);
  }
  try {
    await Categoria.atualizar({ id, nome: nome.trim() });
    req.flash('success_msg', 'Categoria atualizada.');
    res.redirect('/categorias');
  } catch (err) {
    req.flash('error_msg', 'Erro ao atualizar categoria.');
    res.redirect('/categorias');
  }
};

exports.excluir = async (req, res) => {
  const id = req.params.id;
  try {
    // prevenir exclusão se houver filmes vinculados
    const Filme = require('../models/filme');
    const qtd = await Filme.contarPorCategoria(id);
    if (qtd > 0) {
      req.flash('error_msg', 'Não é possível excluir: existem filmes vinculados a esta categoria.');
      return res.redirect('/categorias');
    }

    await Categoria.deletar(id);
    req.flash('success_msg', 'Categoria excluída.');
    res.redirect('/categorias');
  } catch (err) {
    // Se houver restrição de FK (filmes vinculados), mostra mensagem específica
    if (err && (err.errno === 1451 || err.code === 'ER_ROW_IS_REFERENCED_2')) {
      req.flash('error_msg', 'Não é possível excluir: existem filmes vinculados a esta categoria.');
    } else {
      req.flash('error_msg', 'Erro ao excluir categoria.');
    }
    res.redirect('/categorias');
  }
};
