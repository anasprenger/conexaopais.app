const db = require('../config/database');

const SELECT_REVISTA = `
  SELECT r.id, r.slug, r.edicao, r.titulo, r.subtitulo, r.descricao, r.categoria, r.destaques,
         r.pdf_url AS pdfUrl, r.publicada_em AS publicadaEm,
         (SELECT COUNT(*) FROM revista_paginas rp WHERE rp.revista_id = r.id) AS totalPaginas
    FROM revistas r`;

function formatar(linha) {
  return {
    ...linha,
    destaques: (linha.destaques || '').split('\n').filter(Boolean),
    totalPaginas: Number(linha.totalPaginas),
  };
}

async function listar() {
  const [linhas] = await db.execute(`${SELECT_REVISTA} ORDER BY r.edicao DESC`);
  return linhas.map(formatar);
}

async function buscarPorSlug(slug) {
  const [linhas] = await db.execute(`${SELECT_REVISTA} WHERE r.slug = ?`, [slug]);
  if (!linhas[0]) return null;

  const revista = formatar(linhas[0]);
  const [paginas] = await db.execute(
    'SELECT numero, secao, titulo, texto FROM revista_paginas WHERE revista_id = ? ORDER BY numero',
    [revista.id]
  );
  return { ...revista, paginas };
}

module.exports = { listar, buscarPorSlug };
