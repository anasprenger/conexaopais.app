const interacaoModel = require('../models/interacaoModel');
const usuarioModel = require('../models/usuarioModel');
const HttpError = require('../utils/HttpError');
const { verificarCampos } = require('../utils/validacao');
const { buscarOuFalhar } = require('./artigosController');

// POST /api/artigos/:id/interacoes — curtir/descurtir ou salvar/remover dos salvos
async function alternar(req, res) {
  const artigo = await buscarOuFalhar(req.params.id);
  const tipo = req.body?.tipo;
  verificarCampos({ tipo: !['curtida', 'salvo'].includes(tipo) && 'Use "curtida" ou "salvo".' });

  const usuario = await usuarioModel.buscarPorId(Number(req.body?.usuarioId) || 0);
  if (!usuario) throw new HttpError(400, 'Usuário não encontrado.');

  res.json(await interacaoModel.alternar({ usuarioId: usuario.id, publicacaoId: artigo.id, tipo }));
}

module.exports = { alternar };
