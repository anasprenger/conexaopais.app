const db = require('../config/database');

// Campos que podem sair na resposta da API (nunca o hash da senha)
const CAMPOS_PUBLICOS = `id, nome, email, nivel, profissao, registro_profissional AS registroProfissional,
  verificacao, observacao_admin AS observacaoAdmin, criado_em AS criadoEm`;

async function listar({ nivel, verificacao } = {}) {
  const filtros = [];
  const valores = [];
  if (nivel) {
    filtros.push('nivel = ?');
    valores.push(nivel);
  }
  if (verificacao) {
    filtros.push('verificacao = ?');
    valores.push(verificacao);
  }
  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  const [linhas] = await db.execute(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios ${where} ORDER BY criado_em DESC, id DESC`, valores);
  return linhas;
}

async function buscarPorId(id) {
  const [linhas] = await db.execute(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = ?`, [id]);
  return linhas[0] ?? null;
}

// Usado apenas no login: inclui o hash da senha para comparação
async function buscarPorEmailComSenha(email) {
  const [linhas] = await db.execute(`SELECT ${CAMPOS_PUBLICOS}, senha_hash AS senhaHash FROM usuarios WHERE email = ?`, [email]);
  return linhas[0] ?? null;
}

async function emailEmUso(email) {
  const [linhas] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
  return linhas.length > 0;
}

async function criar({ nome, email, senhaHash, nivel, profissao, registroProfissional, verificacao }) {
  const [resultado] = await db.execute(
    `INSERT INTO usuarios (nome, email, senha_hash, nivel, profissao, registro_profissional, verificacao)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nome, email, senhaHash, nivel, profissao ?? null, registroProfissional ?? null, verificacao]
  );
  return buscarPorId(resultado.insertId);
}

async function atualizarVerificacao(id, verificacao, observacao) {
  await db.execute('UPDATE usuarios SET verificacao = ?, observacao_admin = ? WHERE id = ?', [verificacao, observacao ?? null, id]);
  return buscarPorId(id);
}

module.exports = { listar, buscarPorId, buscarPorEmailComSenha, emailEmUso, criar, atualizarVerificacao };
