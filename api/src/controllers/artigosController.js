const artigoModel = require('../models/artigoModel');
const HttpError = require('../utils/HttpError');
const { texto, verificarCampos } = require('../utils/validacao');

// Lê e valida os campos do artigo enviados no corpo da requisição
function dadosDoArtigo(body = {}) {
  const dados = {
    titulo: texto(body.titulo),
    categoria: texto(body.categoria),
    resumo: texto(body.resumo),
    conteudo: texto(body.conteudo).replace(/\r\n/g, '\n'),
  };
  verificarCampos({
    titulo: (dados.titulo.length < 5 || dados.titulo.length > 160) && 'O título deve ter entre 5 e 160 caracteres.',
    categoria: (dados.categoria.length < 2 || dados.categoria.length > 60) && 'Escolha uma categoria.',
    resumo: (dados.resumo.length < 20 || dados.resumo.length > 400) && 'O resumo deve ter entre 20 e 400 caracteres.',
    conteudo: dados.conteudo.length < 50 && 'O texto precisa ter pelo menos 50 caracteres.',
  });
  return dados;
}

async function buscarOuFalhar(slug) {
  const artigo = await artigoModel.buscarPorSlug(slug);
  if (!artigo) throw new HttpError(404, 'Artigo não encontrado.');
  return artigo;
}

// GET /api/artigos?busca=&categoria=&autorId=&autor=
async function listar(req, res) {
  const { busca, categoria, autorId, autor } = req.query;
  res.json(
    await artigoModel.listar({ busca: texto(busca), categoria: texto(categoria), autorId: texto(autorId), autorNome: texto(autor) })
  );
}

// GET /api/artigos/:slug
async function buscar(req, res) {
  res.json(await buscarOuFalhar(req.params.slug));
}

// POST /api/artigos — o middleware exigirPublicador já liberou só admin e profissional aprovado.
// O autor é quem está logado (vem do token); um "autorId" no corpo é ignorado.
async function criar(req, res) {
  const artigo = await artigoModel.criar({ ...dadosDoArtigo(req.body), autorId: req.usuario.id });
  res.status(201).json(artigo);
}

// PUT /api/artigos/:slug — o middleware autorDoArtigoOuAdmin já conferiu quem pode editar
async function atualizar(req, res) {
  if (req.artigo.exemplo) {
    throw new HttpError(400, 'Os artigos de exemplo do site não podem ser editados. A administração pode apenas escondê-los.');
  }
  res.json(await artigoModel.atualizar(req.artigo.id, dadosDoArtigo(req.body)));
}

// DELETE /api/artigos/:slug — o middleware autorDoArtigoOuAdmin já conferiu quem pode excluir.
// Corpo opcional: { justificativa } — quando a administração remove o artigo de outra pessoa,
// o motivo aparece para o autor no site, como na moderação do site.
async function excluir(req, res) {
  const justificativa = texto(req.body?.justificativa) || 'Removida pela administração do Conexão Pais.';
  if (req.artigo.exemplo) {
    await artigoModel.ocultarExemplo(req.artigo, { adminId: req.usuario.id, justificativa });
  } else {
    await artigoModel.excluir(req.artigo, { removidoPor: req.usuario.id, justificativa });
  }
  res.status(204).end();
}

// GET /api/categorias
async function listarCategorias(req, res) {
  res.json(await artigoModel.listarCategorias());
}

module.exports = { listar, buscar, criar, atualizar, excluir, listarCategorias, buscarOuFalhar };
