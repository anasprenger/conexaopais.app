const HttpError = require('../utils/HttpError');
const { ehErroDeConexao, mensagemErroMysql } = require('../utils/erroMysql');

// Rota inexistente
function notFound(req, res) {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

// Tratamento central de erros: toda resposta de erro sai no formato { erro, campos? }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ erro: err.message, ...(err.campos && { campos: err.campos }) });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'O corpo da requisição não é um JSON válido.' });
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ erro: 'Já existe um registro com esses dados.' });
  }
  if (ehErroDeConexao(err)) {
    console.error('Falha ao conectar no MySQL:', mensagemErroMysql(err));
    return res.status(503).json({ erro: 'Banco de dados indisponível. Confira o MySQL e o arquivo .env da API.' });
  }

  console.error(err);
  return res.status(500).json({ erro: 'Erro interno no servidor.' });
}

module.exports = { notFound, errorHandler };
