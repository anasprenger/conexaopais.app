const db = require('../config/database');

// Curtidas e conteúdos salvos de um usuário
async function listarPorUsuario(usuarioId) {
  const [linhas] = await db.execute(
    'SELECT publicacao_id AS publicacaoId, tipo FROM interacoes WHERE usuario_id = ? ORDER BY criado_em DESC',
    [usuarioId]
  );
  return linhas;
}

// Liga/desliga uma curtida ou um "salvo" e devolve a situação atualizada
async function alternar({ usuarioId, publicacaoId, tipo }) {
  const [remocao] = await db.execute('DELETE FROM interacoes WHERE usuario_id = ? AND publicacao_id = ? AND tipo = ?', [
    usuarioId,
    publicacaoId,
    tipo,
  ]);
  const ativo = remocao.affectedRows === 0;
  if (ativo) {
    await db.execute('INSERT INTO interacoes (usuario_id, publicacao_id, tipo) VALUES (?, ?, ?)', [usuarioId, publicacaoId, tipo]);
  }
  const [[{ total }]] = await db.execute('SELECT COUNT(*) AS total FROM interacoes WHERE publicacao_id = ? AND tipo = ?', [
    publicacaoId,
    tipo,
  ]);
  return { publicacaoId, tipo, ativo, total: Number(total) };
}

module.exports = { listarPorUsuario, alternar };
