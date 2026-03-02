const db = require('../config/db');

async function listarTodas() {
  const [rows] = await db.query('SELECT id, nome FROM categorias ORDER BY nome');
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await db.query('SELECT id, nome FROM categorias WHERE id = ?', [id]);
  return rows[0] || null;
}

async function salvar({ nome }) {
  const [result] = await db.query('INSERT INTO categorias (nome) VALUES (?)', [nome]);
  return result.insertId;
}

async function atualizar({ id, nome }) {
  const [result] = await db.query('UPDATE categorias SET nome = ? WHERE id = ?', [nome, id]);
  return result.affectedRows;
}

async function deletar(id) {
  const [result] = await db.query('DELETE FROM categorias WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = {
  listarTodas,
  buscarPorId,
  salvar,
  atualizar,
  deletar
};
