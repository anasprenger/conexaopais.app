const artigoModel = require('../models/artigoModel');
const HttpError = require('../utils/HttpError');
const { idDaRota, texto, verificarCampos } = require('../utils/validacao');

// Lê e valida os campos do artigo enviados no corpo da requisição
function dadosDoArtigo(body = {}) {
  const dados = {
    titulo: texto(body.titulo),
    categoria: texto(body.categoria),
    resumo: texto(body.resumo),
    conteudo: texto(body.conteudo).replace(/\r\n/g, '\n'),
    tags: (Array.isArray(body.tags) ? body.tags : String(body.tags ?? '').split(','))
      .map((tag) => String(tag).trim())
      .filter(Boolean)
      .slice(0, 8),
  };
  verificarCampos({
    titulo: (dados.titulo.length < 5 || dados.titulo.length > 160) && 'O título deve ter entre 5 e 160 caracteres.',
    categoria: (dados.categoria.length < 2 || dados.categoria.length > 60) && 'Escolha uma categoria.',
    resumo: (dados.resumo.length < 20 || dados.resumo.length > 400) && 'O resumo deve ter entre 20 e 400 caracteres.',
    conteudo: dados.conteudo.length < 50 && 'O texto precisa ter pelo menos 50 caracteres.',
    tags: dados.tags.join(', ').length > 255 && 'Use menos tags.',
  });
  return dados;
}

async function buscarOuFalhar(id) {
  const artigo = await artigoModel.buscarPorId(idDaRota(id, 'Artigo'));
  if (!artigo) throw new HttpError(404, 'Artigo não encontrado.');
  return artigo;
}

// GET /api/artigos?busca=&categoria=&autorId=
async function listar(req, res) {
  const { busca, categoria, autorId } = req.query;
  res.json(await artigoModel.listar({ busca: texto(busca), categoria: texto(categoria), autorId: Number(autorId) || null }));
}

// GET /api/artigos/:id
async function buscar(req, res) {
  res.json(await buscarOuFalhar(req.params.id));
}

// POST /api/artigos — o middleware exigirPublicador já liberou só admin e profissional aprovado.
// O autor é quem está logado (vem do token); um "autorId" no corpo é ignorado.
async function criar(req, res) {
  const dados = dadosDoArtigo(req.body);
  const artigo = await artigoModel.criar({ ...dados, autorId: req.usuario.id });
  res.status(201).json(artigo);
}

// PUT /api/artigos/:id — o middleware autorDoArtigoOuAdmin já conferiu quem pode editar
async function atualizar(req, res) {
  res.json(await artigoModel.atualizar(req.artigo.id, dadosDoArtigo(req.body)));
}

// DELETE /api/artigos/:id — o middleware autorDoArtigoOuAdmin já conferiu quem pode excluir
async function excluir(req, res) {
  await artigoModel.excluir(req.artigo.id);
  res.status(204).end();
}

// GET /api/categorias
async function listarCategorias(req, res) {
  res.json(await artigoModel.listarCategorias());
}

module.exports = { listar, buscar, criar, atualizar, excluir, listarCategorias, buscarOuFalhar };
