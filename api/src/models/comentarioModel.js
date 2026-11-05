const db = require('../config/database');

const SELECT_COMENTARIO = `
  SELECT c.id, c.publicacao_id AS publicacaoId, c.texto, c.criado_em AS criadoEm,
         u.id AS usuarioId, u.nome AS autorNome, u.nivel AS autorNivel
    FROM comentarios c
    JOIN usuarios u ON u.id = c.usuario_id`;

async function listarPorPublicacao(publicacaoId) {
  const [linhas] = await db.execute(`${SELECT_COMENTARIO} WHERE c.publicacao_id = ? ORDER BY c.criado_em, c.id`, [publicacaoId]);
  return linhas;
}

async function buscarPorId(id) {
  const [linhas] = await db.execute(`${SELECT_COMENTARIO} WHERE c.id = ?`, [id]);
  return linhas[0] ?? null;
}

async function criar({ publicacaoId, usuarioId, texto }) {
  const [resultado] = await db.execute('INSERT INTO comentarios (publicacao_id, usuario_id, texto) VALUES (?, ?, ?)', [
    publicacaoId,
    usuarioId,
    texto,
  ]);
  return buscarPorId(resultado.insertId);
}

async function excluir(id) {
  const [resultado] = await db.execute('DELETE FROM comentarios WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { listarPorPublicacao, buscarPorId, criar, excluir };
