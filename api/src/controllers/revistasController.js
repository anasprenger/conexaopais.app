const revistaModel = require('../models/revistaModel');
const HttpError = require('../utils/HttpError');
const { texto, verificarCampos } = require('../utils/validacao');

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

// PUT /api/revistas/:slug — { titulo, sinopse } (só a administração)
// Vale para as edições publicadas pelo site; as de exemplo ficam no código do site e não são editadas.
// Trocar o PDF continua sendo pelo site, que faz o envio do arquivo.
async function atualizar(req, res) {
  const titulo = texto(req.body?.titulo);
  const sinopse = texto(req.body?.sinopse);
  verificarCampos({
    titulo: (titulo.length < 3 || titulo.length > 160) && 'O título deve ter entre 3 e 160 caracteres.',
    sinopse: sinopse.length > 4000 && 'A sinopse pode ter até 4000 caracteres.',
  });

  const revista = await revistaModel.buscarPorSlug(req.params.slug);
  if (!revista) throw new HttpError(404, 'Edição não encontrada.');
  if (!revista.id) throw new HttpError(400, 'As edições de exemplo do site não podem ser editadas.');

  await revistaModel.atualizar(revista.id, { titulo, sinopse });
  res.json(await revistaModel.buscarPorSlug(req.params.slug));
}

module.exports = { listar, buscar, atualizar };
