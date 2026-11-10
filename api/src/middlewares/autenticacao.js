const { TokenExpiredError } = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');
const HttpError = require('../utils/HttpError');
const { verificarToken } = require('../utils/token');

// Lê o token do cabeçalho "Authorization: Bearer <token>". Sem cabeçalho, devolve null.
// O nome do esquema não diferencia maiúsculas de minúsculas (Bearer, bearer...), como manda o padrão HTTP.
function tokenDoCabecalho(req) {
  const cabecalho = req.headers.authorization;
  if (!cabecalho) return null;
  const [esquema, token, ...resto] = cabecalho.trim().split(/\s+/);
  if (esquema?.toLowerCase() !== 'bearer' || !token || resto.length > 0) {
    throw new HttpError(401, 'Envie o token no cabeçalho Authorization no formato "Bearer <token>".');
  }
  return token;
}

// Confere o token e busca o dono dele no banco
async function usuarioDoToken(token) {
  let conteudo;
  try {
    conteudo = verificarToken(token);
  } catch (erro) {
    if (erro instanceof TokenExpiredError) throw new HttpError(401, 'Sua sessão expirou. Entre novamente.');
    throw new HttpError(401, 'Sessão inválida. Entre novamente.');
  }

  // O nível e a situação do cadastro vêm do banco, não só do token: se a administração aprovar ou recusar
  // um profissional, a mudança vale na hora, sem novo login. Conta que não existe mais perde o acesso.
  const usuario = await usuarioModel.buscarPorId(Number(conteudo.sub));
  if (!usuario) throw new HttpError(401, 'Conta não encontrada. Entre novamente.');
  return usuario;
}

// Rotas protegidas: exige um token válido e deixa o usuário logado em req.usuario
async function autenticar(req, res, next) {
  const token = tokenDoCabecalho(req);
  if (!token) throw new HttpError(401, 'Entre na sua conta para continuar.');
  req.usuario = await usuarioDoToken(token);
  next();
}

// Rotas abertas que mudam quando há login (ex.: POST /mensagens).
// O token é opcional, mas, se for enviado, precisa ser válido.
async function autenticarSeHouverToken(req, res, next) {
  const token = tokenDoCabecalho(req);
  if (token) req.usuario = await usuarioDoToken(token);
  next();
}

module.exports = { autenticar, autenticarSeHouverToken };
