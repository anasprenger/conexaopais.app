const colunaModel = require('../models/colunaModel');
const HttpError = require('../utils/HttpError');

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

module.exports = { listar, buscar };
