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

    // Mapping de imagens por gênero (Unsplash) — escolha representativa por categoria
    const imageMap = {
      'drama': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=60',
      'comedy': 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1200&q=60',
      'romance': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=60',
      'action': 'https://images.unsplash.com/photo-1524985069026-2b5b0f3a36f8?auto=format&fit=crop&w=1200&q=60',
      'horror': 'https://images.unsplash.com/photo-1500336624523-d727130c3328?auto=format&fit=crop&w=1200&q=60',
      'adventure': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60',
      'fantasy': 'https://images.unsplash.com/photo-1508606572321-901ea443707f?auto=format&fit=crop&w=1200&q=60',
      'crime': 'https://images.unsplash.com/photo-1517964101548-4f3b8f2d5fbb?auto=format&fit=crop&w=1200&q=60',
      'music': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=60',
      'sci-fi': 'https://images.unsplash.com/photo-1519121782396-9f1b1b3f8f2c?auto=format&fit=crop&w=1200&q=60',
      'documentary': 'https://images.unsplash.com/photo-1526318472351-c75fcf0700d7?auto=format&fit=crop&w=1200&q=60',
      'western': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60',
      'thriller': 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=60'
    };

    // Generic fallback images if não houver mapeamento
    const images = [
      'https://images.unsplash.com/photo-1505682634904-d7c0b7d7a4d7?auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1517604645673-4ec9a01d77a6?auto=format&fit=crop&w=800&q=60'
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

    const categoriasWithImage = categoriasWithCount.map((c, i) => {
      const key = (c.nome || '').toString().toLowerCase().trim();
      return {
        ...c,
        image: c.image || imageMap[key] || images[i % images.length],
        icon: c.icon || iconMap[key] || 'bi bi-film'
      };
    });

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
