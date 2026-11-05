const db = require('../config/database');

async function criar({ usuarioId, tipo, nome, email, assunto, mensagem }) {
  const [resultado] = await db.execute(
    'INSERT INTO mensagens (usuario_id, tipo, nome, email, assunto, mensagem) VALUES (?, ?, ?, ?, ?, ?)',
    [usuarioId ?? null, tipo, nome, email, assunto || null, mensagem]
  );
  const [linhas] = await db.execute(
    'SELECT id, tipo, nome, email, assunto, mensagem, status, criado_em AS criadoEm FROM mensagens WHERE id = ?',
    [resultado.insertId]
  );
  return linhas[0];
}

module.exports = { criar };
