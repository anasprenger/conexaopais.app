const revistaModel = require('../models/revistaModel');
const HttpError = require('../utils/HttpError');

// GET /api/revistas
async function listar(req, res) {
  res.json(await revistaModel.listar());
}

// GET /api/revistas/:slug — edição com as páginas
async function buscar(req, res) {
  const revista = await revistaModel.buscarPorSlug(req.params.slug);
  if (!revista) throw new HttpError(404, 'Edição não encontrada.');
  res.json(revista);
}

module.exports = { listar, buscar };
