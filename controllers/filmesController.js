const Filme = require('../models/filme');
const Categoria = require('../models/categoria');

exports.index = async (req, res) => {
  try {
    const filmes = await Filme.listarTodas();
    // Normalize relative image paths to absolute URLs for display
    const host = req.get('host');
    const protocol = req.protocol;
    filmes.forEach(f => {
      if (f.imagem && f.imagem.startsWith('/')) {
        f.imagem = `${protocol}://${host}${f.imagem}`;
      }
    });
    res.render('filmes/index', { title: 'Filmes', filmes });
  } catch (err) {
    req.flash('error_msg', 'Erro ao listar filmes.');
    res.redirect('/');
  }
};

exports.novo = async (req, res) => {
  try {
    const categorias = await Categoria.listarTodas();
    res.render('filmes/novo', { title: 'Novo Filme', categorias });
  } catch (err) {
    req.flash('error_msg', 'Erro ao carregar formulário.');
    res.redirect('/filmes');
  }
};

exports.salvar = async (req, res) => {
  const { titulo, ano, categoria_id, imagem_url } = req.body;
  const imagem_file = req.file;
  if (!titulo || !titulo.trim()) {
    req.flash('error_msg', 'Título é obrigatório.');
    return res.redirect('/filmes/novo');
  }
  if (!categoria_id) {
    req.flash('error_msg', 'Categoria é obrigatória.');
    return res.redirect('/filmes/novo');
  }
  try {
    const imagem = imagem_file ? ('/uploads/' + imagem_file.filename) : (imagem_url && imagem_url.trim() ? imagem_url.trim() : null);
    const insertId = await Filme.salvar({ titulo: titulo.trim(), ano: ano ? parseInt(ano, 10) : null, categoria_id, imagem });
    req.flash('success_msg', 'Filme salvo.');
    // Redirect to edit page so user can see image URL/preview immediately
    res.redirect(`/filmes/editar/${insertId}`);
  } catch (err) {
    req.flash('error_msg', 'Erro ao salvar filme.');
    res.redirect('/filmes/novo');
  }
};

exports.editar = async (req, res) => {
  const id = req.params.id;
  try {
    const filme = await Filme.buscarPorId(id);
    if (!filme) {
      req.flash('error_msg', 'Filme não encontrado.');
      return res.redirect('/filmes');
    }
    const categorias = await Categoria.listarTodas();
    // Normalize relative image path to absolute URL for the edit form
    if (filme.imagem && filme.imagem.startsWith('/')) {
      const host = req.get('host');
      const protocol = req.protocol;
      filme.imagem = `${protocol}://${host}${filme.imagem}`;
    }
    res.render('filmes/editar', { title: 'Editar Filme', filme, categorias });
  } catch (err) {
    req.flash('error_msg', 'Erro ao carregar filme.');
    res.redirect('/filmes');
  }
};

exports.atualizar = async (req, res) => {
  const { id, titulo, ano, categoria_id, imagem_url } = req.body;
  const imagem_file = req.file;
  if (!titulo || !titulo.trim()) {
    req.flash('error_msg', 'Título é obrigatório.');
    return res.redirect(`/filmes/editar/${id}`);
  }
  if (!categoria_id) {
    req.flash('error_msg', 'Categoria é obrigatória.');
    return res.redirect(`/filmes/editar/${id}`);
  }
  try {
    const imagem = imagem_file ? ('/uploads/' + imagem_file.filename) : (imagem_url && imagem_url.trim() ? imagem_url.trim() : null);
    await Filme.atualizar({ id, titulo: titulo.trim(), ano: ano ? parseInt(ano, 10) : null, categoria_id, imagem });
    req.flash('success_msg', 'Filme atualizado.');
    res.redirect('/filmes');
  } catch (err) {
    req.flash('error_msg', 'Erro ao atualizar filme.');
    res.redirect(`/filmes/editar/${id}`);
  }
};

exports.excluir = async (req, res) => {
  const id = req.params.id;
  try {
    await Filme.deletar(id);
    req.flash('success_msg', 'Filme excluído.');
    res.redirect('/filmes');
  } catch (err) {
    req.flash('error_msg', 'Erro ao excluir filme.');
    res.redirect('/filmes');
  }
};
