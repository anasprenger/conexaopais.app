const db = require('../config/database');

const SELECT_COLUNA = `
  SELECT c.id, c.slug, c.nome, c.chamada, c.periodicidade, c.sobre,
         u.id AS colunistaId, u.nome AS colunistaNome, pr.slug AS colunistaSlug,
         (SELECT COUNT(*) FROM coluna_posts cp WHERE cp.coluna_id = c.id) AS totalPosts
    FROM colunas c
    JOIN usuarios u ON u.id = c.colunista_id
    LEFT JOIN profissionais pr ON pr.usuario_id = u.id`;

function formatar(linha) {
  return {
    id: linha.id,
    slug: linha.slug,
    nome: linha.nome,
    chamada: linha.chamada,
    periodicidade: linha.periodicidade,
    sobre: linha.sobre,
    colunista: { id: linha.colunistaId, nome: linha.colunistaNome, slug: linha.colunistaSlug },
    totalPosts: Number(linha.totalPosts),
  };
}

async function listar({ colunistaId } = {}) {
  const where = colunistaId ? 'WHERE c.colunista_id = ?' : '';
  const [linhas] = await db.execute(`${SELECT_COLUNA} ${where} ORDER BY c.id`, colunistaId ? [colunistaId] : []);
  return linhas.map(formatar);
}

async function buscarPorSlug(slug) {
  const [linhas] = await db.execute(`${SELECT_COLUNA} WHERE c.slug = ?`, [slug]);
  if (!linhas[0]) return null;

  const coluna = formatar(linhas[0]);
  const [posts] = await db.execute(
    `SELECT id, slug, titulo, resumo, texto, publicado_em AS publicadoEm
       FROM coluna_posts WHERE coluna_id = ? ORDER BY publicado_em DESC, id DESC`,
    [coluna.id]
  );
  return { ...coluna, posts };
}

module.exports = { listar, buscarPorSlug };
