const db = require('../config/db');

async function listarTodas() {
  const [rows] = await db.query(
    `SELECT f.id, f.titulo, f.ano, f.categoria_id, c.nome AS categoria
     FROM filmes f
     LEFT JOIN categorias c ON f.categoria_id = c.id
     ORDER BY f.titulo`
  );
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await db.query(
    `SELECT f.id, f.titulo, f.ano, f.categoria_id, c.nome AS categoria
     FROM filmes f
     LEFT JOIN categorias c ON f.categoria_id = c.id
     WHERE f.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function salvar({ titulo, ano, categoria_id }) {
  const [result] = await db.query(
    'INSERT INTO filmes (titulo, ano, categoria_id) VALUES (?, ?, ?)',
    [titulo, ano || null, categoria_id || null]
  );
  return result.insertId;
}

async function atualizar({ id, titulo, ano, categoria_id }) {
  const [result] = await db.query(
    'UPDATE filmes SET titulo = ?, ano = ?, categoria_id = ? WHERE id = ?',
    [titulo, ano || null, categoria_id || null, id]
  );
  return result.affectedRows;
}

async function deletar(id) {
  const [result] = await db.query('DELETE FROM filmes WHERE id = ?', [id]);
  return result.affectedRows;
}

async function contarPorCategoria(categoria_id) {
  const [rows] = await db.query('SELECT COUNT(*) AS cnt FROM filmes WHERE categoria_id = ?', [categoria_id]);
  return rows[0] ? rows[0].cnt : 0;
}

module.exports = {
  listarTodas,
  buscarPorId,
  salvar,
  atualizar,
  deletar,
  contarPorCategoria
};
