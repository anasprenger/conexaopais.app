const mensagemModel = require('../models/mensagemModel');
const HttpError = require('../utils/HttpError');
const { emailValido, texto, verificarCampos } = require('../utils/validacao');

// POST /api/mensagens — formulário de Contato (aberto a todos) e "Pergunte à equipe" (exige login).
// As duas vão para as mensagens de contato do site. Com login, nome e e-mail, se faltarem, vêm da conta;
// a pergunta à equipe recebe o assunto "Pergunta à equipe" para a administração identificar.
async function criar(req, res) {
  const usuario = req.usuario ?? null;
  const tipo = req.body?.tipo;
  if (tipo === 'pergunta' && !usuario) throw new HttpError(401, 'Entre na sua conta para perguntar à equipe.');

  const assunto = texto(req.body?.assunto);
  const dados = {
    nome: texto(req.body?.nome) || usuario?.nome || '',
    email: (texto(req.body?.email) || usuario?.email || '').toLowerCase(),
    assunto: tipo === 'pergunta' ? `Pergunta à equipe${assunto ? `: ${assunto}` : ''}` : assunto,
    mensagem: texto(req.body?.mensagem),
  };

  verificarCampos({
    tipo: !['contato', 'pergunta'].includes(tipo) && 'Tipo de mensagem inválido.',
    nome: (dados.nome.length < 2 || dados.nome.length > 120) && 'Informe seu nome.',
    email: !emailValido(dados.email) && 'Informe um e-mail válido.',
    assunto: dados.assunto.length > 160 && 'Use um assunto mais curto (até 160 caracteres).',
    mensagem: (dados.mensagem.length < 10 || dados.mensagem.length > 5000) && 'Escreva sua mensagem (de 10 a 5000 caracteres).',
  });
  res.status(201).json({ tipo, ...(await mensagemModel.criar(dados)) });
}

module.exports = { criar };
