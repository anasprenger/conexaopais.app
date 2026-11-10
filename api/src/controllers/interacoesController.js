const interacaoModel = require('../models/interacaoModel');
const { verificarCampos } = require('../utils/validacao');
const { buscarOuFalhar } = require('./artigosController');

// POST /api/artigos/:id/interacoes — curtir/descurtir ou salvar/remover dos salvos (usuário do token)
async function alternar(req, res) {
  const artigo = await buscarOuFalhar(req.params.id);
  const tipo = req.body?.tipo;
  verificarCampos({ tipo: !['curtida', 'salvo'].includes(tipo) && 'Use "curtida" ou "salvo".' });

  res.json(await interacaoModel.alternar({ usuarioId: req.usuario.id, publicacaoId: artigo.id, tipo }));
}

module.exports = { alternar };
