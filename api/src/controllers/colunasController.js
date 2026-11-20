const colunaModel = require('../models/colunaModel');
const interacaoModel = require('../models/interacaoModel');
const HttpError = require('../utils/HttpError');
const { verificarCampos } = require('../utils/validacao');

// GET /api/colunas
async function listar(req, res) {
  res.json(await colunaModel.listar());
}

// GET /api/colunas/:slug — coluna com suas publicações
async function buscar(req, res) {
  const coluna = await colunaModel.buscarPorSlug(req.params.slug);
  if (!coluna) throw new HttpError(404, 'Coluna não encontrada.');
  res.json(coluna);
}

// POST /api/colunas/:slug/posts/:postSlug/interacoes — curtir ou salvar uma publicação da coluna (usuário do
// token). Como no site, colunas não têm comentários, só curtidas e salvos, ligados ao slug da publicação.
async function alternarInteracao(req, res) {
  const coluna = await colunaModel.buscarPorSlug(req.params.slug);
  const post = coluna?.posts.find((item) => item.slug === req.params.postSlug);
  if (!post) throw new HttpError(404, 'Publicação da coluna não encontrada.');
  const tipo = req.body?.tipo;
  verificarCampos({ tipo: !['curtida', 'salvo'].includes(tipo) && 'Use "curtida" ou "salvo".' });

  res.json(await interacaoModel.alternar({ usuarioId: req.usuario.id, slug: post.slug, tipo }));
}

module.exports = { listar, buscar, alternarInteracao };
