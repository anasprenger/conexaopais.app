const { query } = require('../config/database');
const conteudoSite = require('../data/conteudoSite');
const { linkDoPdf } = require('../services/armazenamento');
const { dataDoTexto } = require('../utils/texto');
const { ocultos } = require('./artigoModel');

// Revista digital, igual ao site: edições de exemplo do site (data/conteudoSite.js) mais as edições que a
// administração publica pelo site (tabela public.publicacoes, tipo "revista", com o PDF no Supabase Storage).

function doExemplo(revista) {
  return {
    slug: revista.slug,
    edicao: revista.edicao,
    titulo: revista.titulo,
    subtitulo: revista.subtitulo,
    descricao: revista.descricao,
    categoria: revista.categoria,
    destaques: revista.destaques,
    pdf: revista.pdf,
    publicadaEm: dataDoTexto(revista.data),
    paginas: revista.conteudo.map((pagina) => ({ ...pagina, texto: pagina.texto.join('\n\n') })),
  };
}

// As edições do banco não têm páginas de texto, só o PDF: o app mostra uma página de apresentação
function doBanco(linha, edicao) {
  const resumo = linha.resumo || 'Edição digital do Conexão Pais.';
  return {
    slug: linha.slug,
    edicao,
    titulo: linha.titulo,
    subtitulo: resumo,
    descricao: resumo,
    categoria: linha.categoria || 'Revista',
    destaques: [],
    pdf: linha.pdf_url,
    publicadaEm: linha.created_at.toISOString().slice(0, 10),
    paginas: [
      {
        numero: 1,
        secao: 'Capa',
        titulo: linha.titulo,
        texto: [resumo, linha.conteudo, 'Toque em "Abrir PDF" para ler a edição completa.'].filter(Boolean).join('\n\n'),
      },
    ],
  };
}

async function todas() {
  const [linhas, escondidos] = await Promise.all([
    query(
      "SELECT slug, titulo, resumo, conteudo, categoria, pdf_url, created_at FROM public.publicacoes WHERE tipo = 'revista' AND status = 'publicado' ORDER BY created_at"
    ),
    ocultos(),
  ]);
  // As edições do banco continuam a numeração das edições de exemplo
  const ultimaEdicao = Math.max(0, ...conteudoSite.revistas.map((revista) => revista.edicao));
  const doSite = linhas.map((linha, indice) => doBanco(linha, ultimaEdicao + indice + 1));
  return [...doSite, ...conteudoSite.revistas.map(doExemplo)]
    .filter((revista) => !escondidos.has(`revista:${revista.slug}`))
    .sort((a, b) => b.edicao - a.edicao);
}

function resumo({ paginas, pdf, ...revista }) {
  return { ...revista, totalPaginas: paginas.length };
}

async function listar() {
  return (await todas()).map(resumo);
}

async function buscarPorSlug(slug) {
  const revista = (await todas()).find((item) => item.slug === slug);
  if (!revista) return null;
  return { ...resumo(revista), pdfUrl: await linkDoPdf(revista.pdf), paginas: revista.paginas };
}

module.exports = { listar, buscarPorSlug };
