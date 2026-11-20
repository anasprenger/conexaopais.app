const { query } = require('../config/database');
const conteudoSite = require('../data/conteudoSite');
const { dataDoTexto } = require('../utils/texto');
const { ocultos } = require('./artigoModel');

// Colunas, igual ao site: as colunas de exemplo do site (data/conteudoSite.js) mais as publicações do tipo
// "coluna" criadas pela administração no site (tabela public.publicacoes). Cada publicação do banco
// aparece como uma coluna com um texto.

function slugDoProfissional(nome) {
  return conteudoSite.profissionais.find((profissional) => profissional.nome === nome)?.slug ?? null;
}

function doExemplo(coluna) {
  return {
    slug: coluna.slug,
    nome: coluna.nome,
    chamada: coluna.chamada,
    periodicidade: coluna.periodicidade,
    sobre: coluna.sobre,
    colunista: { nome: coluna.colunista, slug: slugDoProfissional(coluna.colunista) },
    posts: coluna.posts.map((post) => ({
      slug: post.slug,
      titulo: post.titulo,
      resumo: post.resumo,
      texto: post.texto.join('\n\n'),
      publicadoEm: dataDoTexto(post.data),
    })),
  };
}

function doBanco(linha) {
  return {
    slug: linha.slug,
    nome: linha.titulo,
    chamada: linha.resumo ?? '',
    periodicidade: 'Coluna avulsa',
    sobre: linha.resumo ?? '',
    colunista: { nome: linha.autorNome, slug: slugDoProfissional(linha.autorNome) },
    posts: [
      {
        slug: linha.slug,
        titulo: linha.titulo,
        resumo: linha.resumo ?? '',
        texto: (linha.conteudo ?? '').replace(/\r\n/g, '\n'),
        publicadoEm: linha.created_at.toISOString().slice(0, 10),
      },
    ],
  };
}

async function todas() {
  const [linhas, escondidos] = await Promise.all([
    query(
      `SELECT p.slug, p.titulo, p.resumo, p.conteudo, p.created_at,
              coalesce(pr.display_name, 'Equipe Conexão Pais') AS "autorNome"
         FROM public.publicacoes p LEFT JOIN public.profiles pr ON pr.id = p.autor_id
        WHERE p.tipo = 'coluna' AND p.status = 'publicado' ORDER BY p.created_at DESC`
    ),
    ocultos(),
  ]);
  return [...conteudoSite.colunas.map(doExemplo), ...linhas.map(doBanco)].filter(
    (coluna) => !escondidos.has(`coluna:${coluna.slug}`)
  );
}

function resumo({ posts, ...coluna }) {
  return { ...coluna, totalPosts: posts.length };
}

async function listar({ colunistaNome } = {}) {
  const colunas = await todas();
  return colunas.filter((coluna) => !colunistaNome || coluna.colunista.nome === colunistaNome).map(resumo);
}

async function buscarPorSlug(slug) {
  const coluna = (await todas()).find((item) => item.slug === slug);
  return coluna ? { ...resumo(coluna), posts: coluna.posts } : null;
}

// Publicações de coluna pelo slug: usado para mostrar curtidas e salvos de colunas em "Minha conta"
async function postsPorSlug() {
  const mapa = new Map();
  for (const coluna of await todas()) {
    for (const post of coluna.posts) mapa.set(post.slug, { slug: coluna.slug, nome: coluna.nome, post: post.titulo });
  }
  return mapa;
}

module.exports = { listar, buscarPorSlug, postsPorSlug };
