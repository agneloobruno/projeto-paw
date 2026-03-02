const Categoria = require('../models/categoria');

exports.index = async (req, res) => {
  try {
    const categorias = await Categoria.listarTodas();
    res.render('categorias/index', { title: 'Categorias', categorias });
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
    res.render('categorias/editar', { title: 'Editar Categoria', categoria });
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
