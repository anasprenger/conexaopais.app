const { query } = require('../config/database');
const conteudoSite = require('../data/conteudoSite');
const { dataDoTexto, minutosDeLeitura, normalizar, slugify } = require('../utils/texto');

// ENTIDADE PRINCIPAL: artigos (tabela public.publicacoes do site, tipos "artigo" e "post").
// A lista que o app mostra é a mesma do site:
// 1. publicações criadas por profissionais e pela administração (banco do Supabase), mais novas primeiro;
// 2. artigos de exemplo do site (data/conteudoSite.js), que não ficam no banco.
// Itens que a administração escondeu (tabela conteudos_ocultos) não aparecem.
// Curtidas, salvos e comentários ficam ligados ao SLUG da publicação, como no site.

const SELECT_PUBLICACAO = `
  SELECT p.id, p.tipo, p.slug, p.titulo, p.resumo, p.conteudo, p.categoria, p.status,
         p.autor_id AS "autorId", p.created_at AS "criadoEm", p.updated_at AS "atualizadoEm",
         coalesce(pr.display_name, 'Equipe Conexão Pais') AS "autorNome"
    FROM public.publicacoes p
    LEFT JOIN public.profiles pr ON pr.id = p.autor_id`;

// Perfil público de profissional com o mesmo nome do autor (os perfis do site são ligados pelo nome)
function slugDoProfissional(nome) {
  return conteudoSite.profissionais.find((profissional) => profissional.nome === nome)?.slug ?? null;
}

function doBanco(linha) {
  return {
    id: linha.id,
    slug: linha.slug,
    tipo: linha.tipo,
    titulo: linha.titulo,
    resumo: linha.resumo ?? '',
    categoria: linha.categoria ?? (linha.tipo === 'post' ? 'Post' : 'Comunidade'),
    tags: [],
    destaque: false,
    status: linha.status,
    exemplo: false,
    autor: { id: linha.autorId, nome: linha.autorNome, slug: slugDoProfissional(linha.autorNome) },
    conteudo: (linha.conteudo ?? '').replace(/\r\n/g, '\n'),
    criadoEm: linha.criadoEm,
    atualizadoEm: linha.atualizadoEm,
  };
}

function doExemplo(artigo) {
  const data = dataDoTexto(artigo.data);
  return {
    id: null,
    slug: artigo.slug,
    tipo: 'artigo',
    titulo: artigo.titulo,
    resumo: artigo.resumo,
    categoria: artigo.categoria,
    tags: artigo.tags ?? [],
    destaque: Boolean(artigo.destaque),
    status: 'publicado',
    exemplo: true,
    autor: { id: null, nome: artigo.autor, slug: slugDoProfissional(artigo.autor) },
    conteudo: artigo.conteudo.join('\n\n'),
    criadoEm: data,
    atualizadoEm: data,
  };
}

// Conteúdos escondidos pela administração, no formato "tipo:slug"
async function ocultos() {
  const linhas = await query('SELECT tipo, slug FROM public.conteudos_ocultos');
  return new Set(linhas.map((linha) => `${linha.tipo}:${linha.slug}`));
}

// Totais de curtidas, salvos e comentários de cada slug
async function totaisPorSlug(slugs) {
  if (slugs.length === 0) return new Map();
  const [interacoes, comentarios] = await Promise.all([
    query(
      `SELECT publicacao_slug AS slug,
              count(*) FILTER (WHERE tipo = 'curtida') AS curtidas,
              count(*) FILTER (WHERE tipo = 'salvo') AS salvos
         FROM public.interacoes WHERE publicacao_slug = ANY($1) GROUP BY publicacao_slug`,
      [slugs]
    ),
    query(
      'SELECT publicacao_slug AS slug, count(*) AS total FROM public.comentarios WHERE publicacao_slug = ANY($1) GROUP BY publicacao_slug',
      [slugs]
    ),
  ]);
  const totais = new Map(slugs.map((slug) => [slug, { curtidas: 0, salvos: 0, comentarios: 0 }]));
  interacoes.forEach((linha) => Object.assign(totais.get(linha.slug), { curtidas: Number(linha.curtidas), salvos: Number(linha.salvos) }));
  comentarios.forEach((linha) => Object.assign(totais.get(linha.slug), { comentarios: Number(linha.total) }));
  return totais;
}

// Monta a resposta: totais, tempo de leitura e, na listagem, sem o texto completo
async function comTotais(artigos, comConteudo) {
  const totais = await totaisPorSlug(artigos.map((artigo) => artigo.slug));
  return artigos.map(({ conteudo, ...artigo }) => ({
    ...artigo,
    leituraMin: minutosDeLeitura(artigo.titulo, artigo.resumo, conteudo),
    totais: totais.get(artigo.slug),
    ...(comConteudo && { conteudo }),
  }));
}

// Todas as publicações visíveis: banco (mais novas primeiro) + exemplos do site
async function todosVisiveis() {
  const [linhas, escondidos] = await Promise.all([
    query(`${SELECT_PUBLICACAO} WHERE p.tipo IN ('artigo', 'post') AND p.status = 'publicado' ORDER BY p.created_at DESC`),
    ocultos(),
  ]);
  return [...linhas.map(doBanco), ...conteudoSite.artigos.map(doExemplo)].filter(
    (artigo) => !escondidos.has(`artigo:${artigo.slug}`)
  );
}

// GET /artigos?busca=&categoria=&autorId=&autor=
// A busca ignora acentos e maiúsculas ("geracoes" encontra "Gerações").
async function listar({ busca, categoria, autorId, autorNome } = {}) {
  let artigos = await todosVisiveis();
  if (categoria) artigos = artigos.filter((artigo) => artigo.categoria === categoria);
  if (autorId) artigos = artigos.filter((artigo) => artigo.autor.id === autorId);
  if (autorNome) artigos = artigos.filter((artigo) => artigo.autor.nome === autorNome);
  if (busca) {
    const termo = normalizar(busca);
    artigos = artigos.filter((artigo) =>
      [artigo.titulo, artigo.resumo, artigo.categoria, artigo.autor.nome, ...artigo.tags].some((campo) =>
        normalizar(campo).includes(termo)
      )
    );
  }
  return comTotais(artigos, false);
}

// Publicação pelo slug: primeiro no banco, depois nos exemplos do site.
// Com "incluirOcultos", devolve também um exemplo escondido (usado só para saber se ele existe).
async function buscarPorSlug(slug, { incluirOcultos = false } = {}) {
  const linhas = await query(`${SELECT_PUBLICACAO} WHERE p.slug = $1 AND p.tipo IN ('artigo', 'post')`, [slug]);
  let artigo = linhas[0] ? doBanco(linhas[0]) : null;
  if (!artigo) {
    const exemplo = conteudoSite.artigos.find((item) => item.slug === slug);
    artigo = exemplo ? doExemplo(exemplo) : null;
  }
  if (!artigo) return null;
  if (!incluirOcultos && (artigo.status !== 'publicado' || (await ocultos()).has(`artigo:${slug}`))) return null;
  return (await comTotais([artigo], true))[0];
}

// O slug segue o formato do site: título sem acentos + marca de tempo (ex.: "rotina-de-sono-mtacjwbo")
async function criar({ autorId, titulo, resumo, conteudo, categoria }) {
  const slug = `${slugify(titulo).slice(0, 60)}-${Date.now().toString(36)}`;
  await query(
    `INSERT INTO public.publicacoes (tipo, slug, titulo, resumo, conteudo, categoria, autor_id, status)
     VALUES ('artigo', $1, $2, $3, $4, $5, $6, 'publicado')`,
    [slug, titulo, resumo, conteudo, categoria, autorId]
  );
  return buscarPorSlug(slug);
}

// O slug não muda ao editar: curtidas e comentários continuam ligados à publicação
async function atualizar(id, { titulo, resumo, conteudo, categoria }) {
  const [linha] = await query(
    'UPDATE public.publicacoes SET titulo = $1, resumo = $2, conteudo = $3, categoria = $4 WHERE id = $5 RETURNING slug',
    [titulo, resumo, conteudo, categoria, id]
  );
  return linha ? buscarPorSlug(linha.slug) : null;
}

// Exclui do banco. Quando a administração remove a publicação de outra pessoa, registra o motivo em
// remocoes_publicacao: o site mostra esse aviso ao autor em "Minha conta".
async function excluir(artigo, { removidoPor, justificativa } = {}) {
  if (removidoPor && removidoPor !== artigo.autor.id) {
    await query(
      `INSERT INTO public.remocoes_publicacao (publicacao_id, titulo, tipo, slug, autor_id, removido_por, justificativa)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [artigo.id, artigo.titulo, artigo.tipo, artigo.slug, artigo.autor.id, removidoPor, justificativa]
    );
  }
  await query('DELETE FROM public.publicacoes WHERE id = $1', [artigo.id]);
}

// Artigos de exemplo não estão no banco: "excluir" um deles é escondê-lo, como faz o site
async function ocultarExemplo(artigo, { adminId, justificativa }) {
  await query(
    `INSERT INTO public.conteudos_ocultos (tipo, slug, titulo, justificativa, ocultado_por)
     VALUES ('artigo', $1, $2, $3, $4) ON CONFLICT (tipo, slug) DO NOTHING`,
    [artigo.slug, artigo.titulo, justificativa || null, adminId]
  );
}

async function listarCategorias() {
  const artigos = await todosVisiveis();
  return [...new Set(artigos.map((artigo) => artigo.categoria))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

module.exports = { listar, buscarPorSlug, criar, atualizar, excluir, ocultarExemplo, listarCategorias, ocultos };
