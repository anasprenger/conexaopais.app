const mensagemModel = require('../models/mensagemModel');
const HttpError = require('../utils/HttpError');
const { emailValido, texto, verificarCampos } = require('../utils/validacao');

// POST /api/mensagens — formulário de Contato (aberto a todos) e "Pergunte à equipe" (exige login).
// Com login, a mensagem fica ligada à conta do token; nome e e-mail, se faltarem, vêm da conta.
async function criar(req, res) {
  const usuario = req.usuario ?? null;
  const dados = {
    tipo: req.body?.tipo,
    nome: texto(req.body?.nome) || usuario?.nome || '',
    email: (texto(req.body?.email) || usuario?.email || '').toLowerCase(),
    assunto: texto(req.body?.assunto),
    mensagem: texto(req.body?.mensagem),
    usuarioId: usuario?.id ?? null,
  };
  if (dados.tipo === 'pergunta' && !usuario) throw new HttpError(401, 'Entre na sua conta para perguntar à equipe.');

  verificarCampos({
    tipo: !['contato', 'pergunta'].includes(dados.tipo) && 'Tipo de mensagem inválido.',
    nome: dados.nome.length < 2 && 'Informe seu nome.',
    email: !emailValido(dados.email) && 'Informe um e-mail válido.',
    mensagem: dados.mensagem.length < 10 && 'Escreva sua mensagem (mínimo de 10 caracteres).',
  });
  res.status(201).json(await mensagemModel.criar(dados));
}

module.exports = { criar };
