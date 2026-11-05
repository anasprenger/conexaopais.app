const db = require('../config/database');

const CAMPOS = `p.id, p.slug, p.nome, p.especialidade, p.descricao, p.cidade, p.atendimento, p.whatsapp,
  p.usuario_id AS usuarioId`;

async function listar({ busca, especialidade } = {}) {
  const filtros = [];
  const valores = [];
  if (especialidade) {
    filtros.push('p.especialidade = ?');
    valores.push(especialidade);
  }
  if (busca) {
    filtros.push('(p.nome LIKE ? OR p.especialidade LIKE ? OR p.descricao LIKE ?)');
    const termo = `%${busca}%`;
    valores.push(termo, termo, termo);
  }
  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  const [linhas] = await db.execute(`SELECT ${CAMPOS} FROM profissionais p ${where} ORDER BY p.id`, valores);
  return linhas;
}

async function buscarPorSlug(slug) {
  const [linhas] = await db.execute(`SELECT ${CAMPOS} FROM profissionais p WHERE p.slug = ?`, [slug]);
  return linhas[0] ?? null;
}

module.exports = { listar, buscarPorSlug };
