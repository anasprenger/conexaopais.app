const mensagemModel = require('../models/mensagemModel');
const usuarioModel = require('../models/usuarioModel');
const HttpError = require('../utils/HttpError');
const { emailValido, texto, verificarCampos } = require('../utils/validacao');

// POST /api/mensagens — formulário de Contato e "Pergunte à equipe"
async function criar(req, res) {
  const dados = {
    tipo: req.body?.tipo,
    nome: texto(req.body?.nome),
    email: texto(req.body?.email).toLowerCase(),
    assunto: texto(req.body?.assunto),
    mensagem: texto(req.body?.mensagem),
    usuarioId: Number(req.body?.usuarioId) || null,
  };
  verificarCampos({
    tipo: !['contato', 'pergunta'].includes(dados.tipo) && 'Tipo de mensagem inválido.',
    nome: dados.nome.length < 2 && 'Informe seu nome.',
    email: !emailValido(dados.email) && 'Informe um e-mail válido.',
    mensagem: dados.mensagem.length < 10 && 'Escreva sua mensagem (mínimo de 10 caracteres).',
  });
  if (dados.usuarioId && !(await usuarioModel.buscarPorId(dados.usuarioId))) {
    throw new HttpError(400, 'Usuário não encontrado.');
  }
  res.status(201).json(await mensagemModel.criar(dados));
}

module.exports = { criar };
