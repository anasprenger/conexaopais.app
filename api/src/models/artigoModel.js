const db = require('../config/database');
const { listaDeTags, minutosDeLeitura, slugify } = require('../utils/texto');

// Artigo + autor + totais de curtidas, salvos e comentários
const SELECT_ARTIGO = `
  SELECT p.id, p.slug, p.titulo, p.resumo, p.conteudo, p.categoria, p.tags, p.destaque, p.status,
         p.criado_em AS criadoEm, p.atualizado_em AS atualizadoEm,
         u.id AS autorId, u.nome AS autorNome, pr.slug AS autorSlug,
         (SELECT COUNT(*) FROM interacoes i WHERE i.publicacao_id = p.id AND i.tipo = 'curtida') AS curtidas,
         (SELECT COUNT(*) FROM interacoes i WHERE i.publicacao_id = p.id AND i.tipo = 'salvo') AS salvos,
         (SELECT COUNT(*) FROM comentarios c WHERE c.publicacao_id = p.id) AS comentarios
    FROM publicacoes p
    JOIN usuarios u ON u.id = p.autor_id
    LEFT JOIN profissionais pr ON pr.usuario_id = u.id`;

function formatar(linha, comConteudo) {
  return {
    id: linha.id,
    slug: linha.slug,
    titulo: linha.titulo,
    resumo: linha.resumo,
    categoria: linha.categoria,
    tags: listaDeTags(linha.tags),
    destaque: Boolean(linha.destaque),
    status: linha.status,
    autor: { id: linha.autorId, nome: linha.autorNome, slug: linha.autorSlug },
    leituraMin: minutosDeLeitura(linha.titulo, linha.resumo, linha.conteudo),
    totais: { curtidas: Number(linha.curtidas), salvos: Number(linha.salvos), comentarios: Number(linha.comentarios) },
    criadoEm: linha.criadoEm,
    atualizadoEm: linha.atualizadoEm,
    ...(comConteudo && { conteudo: linha.conteudo }),
  };
}

async function listar({ busca, categoria, autorId } = {}) {
  const filtros = ["p.tipo = 'artigo'", "p.status = 'publicado'"];
  const valores = [];
  if (categoria) {
    filtros.push('p.categoria = ?');
    valores.push(categoria);
  }
  if (autorId) {
    filtros.push('p.autor_id = ?');
    valores.push(autorId);
  }
  if (busca) {
    // a collation utf8mb4_unicode_ci ignora acentos e maiúsculas ("geracoes" encontra "gerações")
    filtros.push('(p.titulo LIKE ? OR p.resumo LIKE ? OR p.categoria LIKE ? OR p.tags LIKE ? OR u.nome LIKE ?)');
    const termo = `%${busca}%`;
    valores.push(termo, termo, termo, termo, termo);
  }
  const [linhas] = await db.execute(
    `${SELECT_ARTIGO} WHERE ${filtros.join(' AND ')} ORDER BY p.destaque DESC, p.criado_em DESC, p.id DESC`,
    valores
  );
  return linhas.map((linha) => formatar(linha, false));
}

async function buscarPorId(id) {
  const [linhas] = await db.execute(`${SELECT_ARTIGO} WHERE p.id = ? AND p.tipo = 'artigo'`, [id]);
  return linhas[0] ? formatar(linhas[0], true) : null;
}

async function criar({ autorId, titulo, resumo, conteudo, categoria, tags }) {
  const slug = `${slugify(titulo)}-${Date.now().toString(36)}`;
  const [resultado] = await db.execute(
    `INSERT INTO publicacoes (autor_id, tipo, slug, titulo, resumo, conteudo, categoria, tags)
     VALUES (?, 'artigo', ?, ?, ?, ?, ?, ?)`,
    [autorId, slug, titulo, resumo, conteudo, categoria, tags.join(', ')]
  );
  return buscarPorId(resultado.insertId);
}

async function atualizar(id, { titulo, resumo, conteudo, categoria, tags }) {
  await db.execute(
    'UPDATE publicacoes SET titulo = ?, resumo = ?, conteudo = ?, categoria = ?, tags = ? WHERE id = ?',
    [titulo, resumo, conteudo, categoria, tags.join(', '), id]
  );
  return buscarPorId(id);
}

async function excluir(id) {
  const [resultado] = await db.execute("DELETE FROM publicacoes WHERE id = ? AND tipo = 'artigo'", [id]);
  return resultado.affectedRows > 0;
}

async function listarCategorias() {
  const [linhas] = await db.execute(
    "SELECT DISTINCT categoria FROM publicacoes WHERE tipo = 'artigo' AND status = 'publicado' ORDER BY categoria"
  );
  return linhas.map((linha) => linha.categoria);
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir, listarCategorias };
