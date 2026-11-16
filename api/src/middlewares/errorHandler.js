const HttpError = require('../utils/HttpError');
const { ehErroDeConexao, mensagemErroBanco } = require('../utils/erroBanco');

// Rota inexistente
function notFound(req, res) {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

// Mensagens que as funções do banco do site devolvem (RAISE EXCEPTION), sem acento no original
const MENSAGENS_DO_BANCO = {
  'Dados de contato invalidos': 'Confira nome, e-mail e mensagem (mínimo de 10 caracteres).',
  'Limite de mensagens atingido. Tente novamente mais tarde': 'Você já enviou 3 mensagens na última hora. Tente novamente mais tarde.',
  'Somente a administracao pode alterar a verificacao profissional': 'Somente a administração pode alterar a verificação profissional.',
};

// Tratamento central de erros: toda resposta de erro sai no formato { erro, campos? }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ erro: err.message, ...(err.campos && { campos: err.campos }) });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'O corpo da requisição não é um JSON válido.' });
  }
  if (err.code === '23505') {
    return res.status(409).json({ erro: 'Já existe um registro com esses dados.' });
  }
  if (err.code === 'P0001') {
    // regra de uma função ou gatilho do banco do site
    const status = /Limite/.test(err.message) ? 429 : 400;
    return res.status(status).json({ erro: MENSAGENS_DO_BANCO[err.message] ?? err.message });
  }
  if (ehErroDeConexao(err)) {
    console.error('Falha ao conectar no banco (Supabase):', mensagemErroBanco(err));
    return res.status(503).json({ erro: 'Banco de dados indisponível. Confira a internet e o arquivo .env da API.' });
  }

  console.error(err);
  return res.status(500).json({ erro: 'Erro interno no servidor.' });
}

module.exports = { notFound, errorHandler };
